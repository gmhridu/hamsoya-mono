import { and, eq } from 'drizzle-orm';
import type { User } from '../db';
import { getDb, refreshTokens, users } from '../db';
import { generateOTP, hashPassword, verifyPassword } from '../lib/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { RedisService } from '../lib/redis';
import { securityAudit } from '../lib/security-audit';
import { sendOTPVerificationEmail, sendPasswordResetEmail } from '../lib/sendEmail';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOTPInput,
} from '../types/auth';
import { UserRole } from '../types/auth';
import { AppError } from '../utils/error-handler';

export class AuthService {
  private db: ReturnType<typeof getDb>;
  private redis: RedisService;
  private env: any;

  constructor(env?: any) {
    this.env = env;
    this.db = getDb(env);
    this.redis = new RedisService(env?.REDIS_URL);
  }

  // Register new user (Step 1: Store registration data and send OTP)
  async register(input: RegisterInput): Promise<{ message: string }> {
    const { name, email, password, role, phone_number, profile_image_url } = input;

    // Check if user already exists
    const existingUser = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Store registration data in Redis temporarily (instead of creating user immediately)
    const registrationData = {
      name,
      email,
      password_hash: passwordHash,
      role: role as UserRole,
      phone_number,
      profile_image_url,
    };

    // Store registration data in Redis with 30 minutes expiry
    await this.redis.setRegistrationData(email, registrationData);

    // Generate and send OTP
    await this.sendVerificationOTP(email, name);

    return {
      message: 'Registration initiated. Please check your email for verification OTP.',
    };
  }

  // Send verification OTP (works for both registration and resend)
  async sendVerificationOTP(email: string, name?: string): Promise<{ message: string }> {
    // Check if this is for registration (registration data exists) or existing user
    const registrationData = await this.redis.getRegistrationData(email);
    const user = await this.getUserByEmail(email);

    if (!registrationData && !user) {
      throw new AppError('No registration data or user found for this email', 404);
    }

    if (user && user.is_verified) {
      throw new AppError('User is already verified', 400);
    }

    // Check rate limiting
    await this.checkOTPRateLimit(email);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Redis
    await this.redis.setOTP(email, otp);
    await this.redis.setCooldown(email);

    // Development mode: Log OTP for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Development mode: OTP for ${email} is: ${otp}`);
    }

    // Use name from registration data or existing user
    const userName = name || registrationData?.name || user?.name || 'User';

    // Send email using optimized enhanced templates
    console.log(`🚀 Sending OTP verification email to ${email}...`);
    const emailStart = Date.now();

    try {
      // Always use professional EJS email templates for consistent branding
      const { sendEnhancedOTPVerificationEmail } = require('../lib/sendEmail');
      await sendEnhancedOTPVerificationEmail(email, userName, otp, this.env);

      const emailTime = Date.now() - emailStart;
      console.log(`✅ Professional EJS OTP email sent to ${email} in ${emailTime}ms`);
    } catch (error) {
      const emailTime = Date.now() - emailStart;
      console.error(`❌ Professional email failed after ${emailTime}ms:`, error);

      // Fallback to legacy email template if EJS fails
      try {
        await sendOTPVerificationEmail(email, userName, otp, this.env);
        const fallbackTime = Date.now() - emailStart;
        console.log(`✅ Fallback legacy email sent to ${email} in ${fallbackTime}ms`);
      } catch (fallbackError) {
        console.error('❌ Failed to send fallback email:', fallbackError);
        // In development, still provide helpful feedback
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔍 Development mode: OTP generated for ${email} (check email for code)`);
          return {
            message: `Verification OTP generated. Check your email for the verification code.`,
          };
        }
        throw fallbackError;
      }
    }

    return { message: 'Verification OTP sent to your email' };
  }

  // Get OTP cooldown status
  async getOTPCooldownStatus(
    email: string
  ): Promise<{ cooldownRemaining: number; canResend: boolean }> {
    const cooldownRemaining = await this.redis.getCooldownRemaining(email);
    return {
      cooldownRemaining,
      canResend: cooldownRemaining === 0,
    };
  }

  // Verify OTP (Step 2: Create user after successful verification)
  async verifyOTP(input: VerifyOTPInput): Promise<{ message: string }> {
    const { email, otp } = input;

    // Check if account is locked due to too many failed attempts
    const failCount = await this.redis.getOTPFailCount(email);
    if (failCount >= 5) {
      throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
    }

    // Get stored OTP
    const storedOTP = await this.redis.getOTP(email);
    if (!storedOTP) {
      throw new AppError('OTP expired or not found. Please request a new one.', 400);
    }

    // Verify OTP using consistent attempt counting
    if (otp !== storedOTP) {
      // Increment failure count using the enhanced system
      const newFailCount = await this.redis.incrementOTPFailCount(email);
      const remainingAttempts = 5 - newFailCount;

      if (remainingAttempts <= 0) {
        // Lock the account
        await this.redis.setLock(email, 15); // 15 minutes lock
        await this.redis.cleanup(email);
        throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
      }

      throw new AppError(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
    }

    // Get registration data from Redis
    const registrationData = await this.redis.getRegistrationData(email);
    if (!registrationData) {
      throw new AppError('Registration data expired. Please register again.', 400);
    }

    // Check if user already exists (in case of race condition)
    const existingUser = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user with verified status
    await this.db
      .insert(users)
      .values({
        ...registrationData,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // Cleanup Redis
    await this.redis.cleanup(email);
    await this.redis.deleteRegistrationData(email);

    return { message: 'Email verified successfully. Account created!' };
  }

  // Login user
  async login(input: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password_hash'>;
  }> {
    const { email, password } = input;

    // Get user
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.is_verified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(tokenPayload, this.env);
    const refreshToken = generateRefreshToken(tokenPayload, this.env);

    // Store refresh token in database
    await this.db.insert(refreshTokens).values({
      user_id: user.id,
      token_hash: refreshToken, // In production, hash this
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    };
  }

  // Refresh token
  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(token, this.env);

      // Check if token exists in database
      const storedToken = await this.db
        .select()
        .from(refreshTokens)
        .where(and(eq(refreshTokens.token_hash, token), eq(refreshTokens.user_id, payload.userId)))
        .limit(1);

      if (storedToken.length === 0) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Check if token is expired
      if (storedToken[0].expires_at < new Date()) {
        // Delete expired token
        await this.db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken[0].id));

        throw new AppError('Refresh token expired', 401);
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        },
        this.env
      );

      const newRefreshToken = generateRefreshToken(
        {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        },
        this.env
      );

      // Update refresh token in database
      await this.db
        .update(refreshTokens)
        .set({
          token_hash: newRefreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        .where(eq(refreshTokens.id, storedToken[0].id));

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  // Forgot password
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const { email } = input;

    // Check if user exists
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'If an account with this email exists, you will receive a password reset OTP.',
      };
    }

    // Check rate limiting
    await this.checkOTPRateLimit(email, 'password_reset');

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Redis
    await this.redis.setOTP(email, otp);
    await this.redis.setCooldown(email, 'password_reset');

    // Send email using enhanced templates
    try {
      // Import enhanced email function dynamically to avoid circular imports
      const { sendEnhancedPasswordResetEmail } = await import('../lib/sendEmail');
      await sendEnhancedPasswordResetEmail(email, user.name, otp, this.env);
      console.log(`✅ Enhanced password reset email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send enhanced password reset email:', error);
      // Fallback to regular email template
      await sendPasswordResetEmail(email, user.name, otp, this.env);
      console.log(`✅ Fallback password reset email sent to ${email}`);
    }

    return {
      message: 'If an account with this email exists, you will receive a password reset OTP.',
    };
  }

  // Verify forgot password OTP
  async verifyForgotPasswordOTP(input: VerifyOTPInput): Promise<{ message: string }> {
    const { email, otp } = input;

    // Check if user exists
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if account is locked due to too many failed attempts
    const failCount = await this.redis.getOTPFailCount(email);
    if (failCount >= 5) {
      throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
    }

    // Get stored OTP
    const storedOTP = await this.redis.getOTP(email);
    if (!storedOTP) {
      throw new AppError('OTP expired or not found. Please request a new one.', 400);
    }

    // Verify OTP using consistent attempt counting
    if (otp !== storedOTP) {
      // Increment failure count using the enhanced system
      const newFailCount = await this.redis.incrementOTPFailCount(email);
      const remainingAttempts = 5 - newFailCount;

      if (remainingAttempts <= 0) {
        // Lock the account
        await this.redis.setLock(email, 15); // 15 minutes lock
        await this.redis.cleanup(email, 'password_reset');
        throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
      }

      throw new AppError(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
    }

    // Mark as verified for password reset
    await this.redis.setPasswordResetVerified(email);
    await this.redis.cleanup(email, 'password_reset');

    return { message: 'OTP verified. You can now reset your password.' };
  }

  // Reset password
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const { email, password } = input;

    // Check if user exists
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if password reset was verified
    const isVerified = await this.redis.checkPasswordResetVerified(email);
    if (!isVerified) {
      throw new AppError('Please verify OTP first', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password
    await this.db
      .update(users)
      .set({
        password_hash: passwordHash,
        updated_at: new Date(),
      })
      .where(eq(users.email, email));

    // Cleanup Redis
    await this.redis.removePasswordResetVerified(email);

    // Revoke all refresh tokens for this user
    await this.db.delete(refreshTokens).where(eq(refreshTokens.user_id, user.id));

    return { message: 'Password reset successfully' };
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      throw new AppError('User not found', 404);
    }

    const { password_hash, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  // Helper methods
  private async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    return result.length > 0 ? result[0] : null;
  }

  private async checkOTPRateLimit(
    email: string,
    type: 'otp' | 'password_reset' = 'otp'
  ): Promise<void> {
    // Check cooldown
    const inCooldown = await this.redis.checkCooldown(email, type);
    if (inCooldown) {
      throw new AppError('Please wait 60 seconds before requesting another OTP', 429);
    }

    // Check hourly limit
    const attempts = await this.redis.getAttempts(email, type);
    if (attempts >= 2) {
      await this.redis.setLock(email, 60, type); // Lock for 1 hour
      throw new AppError('Too many OTP requests. Please try again in 1 hour.', 429);
    }

    // Check if locked
    const isLocked = await this.redis.checkLock(email, type);
    if (isLocked) {
      throw new AppError('Account is temporarily locked. Please try again later.', 429);
    }

    // Increment attempts
    await this.redis.incrementAttempts(email, type);
  }

  // Enhanced OTP sending with comprehensive rate limiting
  async sendOTPWithRateLimit(
    email: string,
    clientIP: string
  ): Promise<{ message: string; cooldownRemaining?: number }> {
    // Check if user exists and is already verified
    const user = await this.getUserByEmail(email);
    const registrationData = await this.redis.getRegistrationData(email);

    if (!registrationData && !user) {
      throw new AppError('No registration data or user found for this email', 404);
    }

    if (user && user.is_verified) {
      throw new AppError('User is already verified', 400);
    }

    // Check email-based rate limiting
    const emailSendCount = await this.redis.getOTPSendCount(email);
    if (emailSendCount >= 5) {
      // Security audit logging for rate limit hit
      await securityAudit.logRateLimitHit(email, clientIP, undefined, 'email');

      // OTP_LIMITS.MAX_SEND_ATTEMPTS_PER_HOUR
      throw new AppError('Too many OTP requests for this email. Please try again in 1 hour.', 429);
    }

    // Check IP-based rate limiting
    const ipSendCount = await this.redis.getIPSendCount(clientIP);
    if (ipSendCount >= 10) {
      // Security audit logging for IP rate limit and blocking
      await securityAudit.logRateLimitHit(email, clientIP, undefined, 'ip');
      await securityAudit.logIPBlocked(clientIP, 'rate_limit');

      // OTP_LIMITS.MAX_IP_SEND_ATTEMPTS_PER_HOUR
      await this.redis.setIPLock(clientIP);
      throw new AppError('Too many OTP requests from this IP. Please try again in 1 hour.', 429);
    }

    // Check IP lock
    const isIPLocked = await this.redis.checkIPLock(clientIP);
    if (isIPLocked) {
      throw new AppError('IP temporarily blocked due to too many requests.', 429);
    }

    // Check cooldown
    const cooldownRemaining = await this.redis.getCooldownRemaining(email);
    if (cooldownRemaining > 0) {
      throw new AppError(
        `Please wait ${cooldownRemaining} seconds before requesting another OTP.`,
        429
      );
    }

    // Generate and store OTP
    const otp = generateOTP();
    await this.redis.setOTP(email, otp);
    await this.redis.setCooldown(email);

    // Development mode: Log OTP for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Development mode: OTP for ${email} is: ${otp}`);
    }

    // Security audit logging
    await securityAudit.logOTPGenerated(email, clientIP);

    // Increment counters
    await this.redis.incrementOTPSendCount(email);
    await this.redis.incrementIPSendCount(clientIP);

    // Get user name
    const userName = registrationData?.name || user?.name || 'User';

    // Send email using optimized enhanced template
    console.log(`🚀 Sending OTP verification email to ${email}...`);
    const emailStart = Date.now();

    try {
      // Always use professional EJS email templates for consistent branding
      const { sendEnhancedOTPVerificationEmail } = require('../lib/sendEmail');
      await sendEnhancedOTPVerificationEmail(email, userName, otp, this.env);

      const emailTime = Date.now() - emailStart;
      console.log(`✅ Professional EJS OTP email sent to ${email} in ${emailTime}ms`);
    } catch (enhancedError) {
      const emailTime = Date.now() - emailStart;
      console.warn(
        `Professional email failed after ${emailTime}ms, using fallback:`,
        enhancedError
      );
      await sendOTPVerificationEmail(email, userName, otp, this.env);
    }

    try {
      // Security audit logging for successful OTP send
      await securityAudit.logOTPSent(email, clientIP, undefined, 'email');

      console.log(`✅ Enhanced OTP sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      // In development, still don't log OTP for security
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Development mode: OTP generated for ${email} (check email for code)`);
      } else {
        throw new AppError('Failed to send OTP email. Please try again.', 500);
      }
    }

    return {
      message: 'OTP sent successfully. Please check your email.',
    };
  }

  // Enhanced OTP verification with brute-force protection
  async verifyOTPEnhanced(
    input: { email: string; otp: string },
    clientIP: string
  ): Promise<{ message: string; remainingAttempts?: number }> {
    const { email, otp } = input;

    // Check if account is locked due to too many failed attempts
    const failCount = await this.redis.getOTPFailCount(email);
    if (failCount >= 5) {
      // OTP_LIMITS.MAX_VERIFY_ATTEMPTS
      throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
    }

    // Get stored OTP
    const storedOTP = await this.redis.getOTP(email);
    if (!storedOTP) {
      throw new AppError('OTP expired or not found. Please request a new one.', 400);
    }

    // Verify OTP using constant-time comparison
    const isValidOTP = otp === storedOTP; // We'll use the secure version once imports are fixed

    if (!isValidOTP) {
      // Security audit logging for failed attempt
      await securityAudit.logOTPFailed(email, clientIP, undefined, 'invalid_otp');

      // Increment failure count
      const newFailCount = await this.redis.incrementOTPFailCount(email);
      const remainingAttempts = 5 - newFailCount; // OTP_LIMITS.MAX_VERIFY_ATTEMPTS

      if (remainingAttempts <= 0) {
        // Security audit logging for account lock
        await securityAudit.logAccountLocked(email, clientIP, undefined, 'max_otp_attempts');

        // Lock the account
        await this.redis.setLock(email, 15); // OTP_LIMITS.VERIFY_LOCK_MINUTES
        await this.redis.cleanup(email);
        throw new AppError('Too many incorrect attempts. Account locked for 15 minutes.', 429);
      }

      throw new AppError(`Invalid OTP. ${remainingAttempts} attempts remaining.`, 400);
    }

    // OTP is valid - proceed with user creation/verification
    const registrationData = await this.redis.getRegistrationData(email);
    if (!registrationData) {
      throw new AppError('Registration data expired. Please register again.', 400);
    }

    // Check if user already exists (race condition protection)
    const existingUser = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Create user with verified status
    await this.db
      .insert(users)
      .values({
        ...registrationData,
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    // Security audit logging for successful verification
    await securityAudit.logOTPVerified(email, clientIP);

    // Cleanup all OTP-related Redis keys
    await this.redis.cleanupAll(email, clientIP);
    await this.redis.deleteRegistrationData(email);

    return {
      message: 'Email verified successfully. Account created!',
    };
  }
}
