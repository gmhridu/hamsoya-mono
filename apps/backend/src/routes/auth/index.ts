import { Hono } from 'hono';
import cooldownStatus from './cooldown-status';
import forgotPassword from './forgot-password';
import login from './login';
import me from './me';
import refreshToken from './refresh-token';
import register from './register';
import resendVerification from './resend-verification';
import resetPassword from './reset-password';
import sendOtp from './send-otp';
import verify from './verify';
import verifyForgotPassword from './verify-forgot-password';
import verifyOtpEnhanced from './verify-otp-enhanced';

const app = new Hono();

// Mount auth routes
app.route('/register', register);
app.route('/login', login);
app.route('/verify', verify);
app.route('/resend-verification', resendVerification);
app.route('/cooldown-status', cooldownStatus);
app.route('/forgot-password', forgotPassword);
app.route('/verify-forgot-password', verifyForgotPassword);
app.route('/reset-password', resetPassword);
app.route('/refresh-token', refreshToken);
app.route('/me', me);

// Enhanced OTP endpoints
app.route('/send-otp', sendOtp);
app.route('/verify-otp-enhanced', verifyOtpEnhanced);

export default app;
