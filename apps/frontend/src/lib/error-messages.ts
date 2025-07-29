/**
 * Utility functions to transform technical error messages into user-friendly ones
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
}

/**
 * Transform technical error messages into user-friendly ones
 */
export function getUserFriendlyError(error: any): UserFriendlyError {
  // Handle different error formats
  const errorMessage = error?.message || error?.error || error || 'An unexpected error occurred';
  const statusCode = error?.status || error?.statusCode;

  // Convert to lowercase for easier matching
  const lowerMessage = errorMessage.toLowerCase();

  // Authentication errors
  if (
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('invalid email or password')
  ) {
    return {
      title: 'Login Failed',
      message:
        'The email or password you entered is incorrect. Please check your credentials and try again.',
      action: 'Double-check your email and password, or use "Forgot Password" if needed.',
    };
  }

  if (
    lowerMessage.includes('user not found') ||
    lowerMessage.includes('account not found') ||
    lowerMessage.includes('no registration data') ||
    lowerMessage.includes('no user found')
  ) {
    return {
      title: 'Account Not Found',
      message: 'No account exists with this email address.',
      action: 'Please check your email or create a new account.',
    };
  }

  if (
    lowerMessage.includes('user with this email already exists') ||
    lowerMessage.includes('email already exists')
  ) {
    return {
      title: 'Account Already Exists',
      message: 'An account with this email address already exists.',
      action: 'Try logging in instead, or use a different email address.',
    };
  }

  if (
    lowerMessage.includes('user is already verified') ||
    lowerMessage.includes('already verified')
  ) {
    return {
      title: 'Account Already Verified',
      message: 'Your account has already been verified.',
      action: 'You can now log in to your account.',
    };
  }

  // OTP errors with attempt tracking
  if (
    lowerMessage.includes('invalid otp') ||
    lowerMessage.includes('wrong otp') ||
    lowerMessage.includes('incorrect otp')
  ) {
    // Check if the message contains attempt information
    const attemptMatch = lowerMessage.match(/(\d+)\s+attempts?\s+remaining/);
    if (attemptMatch) {
      const remaining = attemptMatch[1];
      return {
        title: 'Invalid Verification Code',
        message: `The verification code is incorrect. You have ${remaining} attempt${
          remaining === '1' ? '' : 's'
        } remaining.`,
        action: 'Please check the code in your email and try again carefully.',
      };
    }

    return {
      title: 'Invalid Verification Code',
      message: 'The verification code you entered is incorrect.',
      action: 'Please check the code in your email and try again, or request a new code.',
    };
  }

  if (lowerMessage.includes('otp expired') || lowerMessage.includes('code expired')) {
    return {
      title: 'Verification Code Expired',
      message: 'Your verification code has expired.',
      action: 'Please request a new verification code.',
    };
  }

  if (
    lowerMessage.includes('too many failed attempts') ||
    lowerMessage.includes('account locked')
  ) {
    return {
      title: 'Account Temporarily Locked',
      message: 'Your account has been temporarily locked due to too many failed attempts.',
      action: 'Please wait 30 minutes before trying again, or contact support if you need help.',
    };
  }

  if (lowerMessage.includes('registration data expired')) {
    return {
      title: 'Registration Session Expired',
      message: 'Your registration session has expired.',
      action: 'Please start the registration process again.',
    };
  }

  // Rate limiting errors - Enhanced patterns to catch OTP-specific rate limiting
  if (
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many otp requests') ||
    lowerMessage.includes('too many attempts')
  ) {
    // Extract time information if present (e.g., "1 hour", "30 minutes")
    const timeMatch = lowerMessage.match(/(\d+)\s*(hour|minute|min)s?/);
    let waitTime = 'a few minutes';

    if (timeMatch) {
      const [, number, unit] = timeMatch;
      waitTime = `${number} ${unit}${number === '1' ? '' : 's'}`;
    }

    return {
      title: 'Too Many Requests',
      message: `You've made too many requests. Please wait ${waitTime} before trying again.`,
      action: `Wait ${waitTime} and try again.`,
    };
  }

  if (
    lowerMessage.includes('cooldown') ||
    lowerMessage.includes('wait before requesting') ||
    lowerMessage.includes('please try again in')
  ) {
    return {
      title: 'Please Wait',
      message: 'You need to wait before requesting another verification code.',
      action: 'Please wait for the countdown to finish before requesting a new code.',
    };
  }

  // Network and server errors
  if (lowerMessage.includes('network error') || lowerMessage.includes('fetch failed')) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      action: 'Check your internet connection and try again.',
    };
  }

  if (lowerMessage.includes('server error') || statusCode >= 500) {
    return {
      title: 'Server Error',
      message: 'Our servers are experiencing issues. Please try again in a few moments.',
      action: 'Wait a moment and try again. If the problem persists, contact support.',
    };
  }

  // Email errors
  if (
    lowerMessage.includes('failed to send email') ||
    lowerMessage.includes('email sending failed')
  ) {
    return {
      title: 'Email Delivery Issue',
      message: "We couldn't send the verification email to your address.",
      action: 'Please check your email address and try again, or contact support.',
    };
  }

  // Validation errors
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid format')) {
    return {
      title: 'Invalid Information',
      message: 'Some of the information you provided is not in the correct format.',
      action: 'Please check your entries and make sure all fields are filled correctly.',
    };
  }

  // Password errors
  if (
    lowerMessage.includes('password too weak') ||
    lowerMessage.includes('password requirements')
  ) {
    return {
      title: 'Password Requirements Not Met',
      message: "Your password doesn't meet our security requirements.",
      action: 'Use at least 8 characters with a mix of letters, numbers, and symbols.',
    };
  }

  // Generic HTTP status code errors
  switch (statusCode) {
    case 400:
      return {
        title: 'Invalid Request',
        message: 'The information provided is not valid.',
        action: 'Please check your entries and try again.',
      };
    case 401:
      return {
        title: 'Authentication Required',
        message: 'You need to log in to access this feature.',
        action: 'Please log in and try again.',
      };
    case 403:
      return {
        title: 'Access Denied',
        message: "You don't have permission to perform this action.",
        action: 'Contact support if you believe this is an error.',
      };
    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        action: 'Please check the information and try again.',
      };
    case 429:
      return {
        title: 'Too Many Attempts',
        message: "You've made too many requests. Please wait before trying again.",
        action: 'Wait a few minutes and try again.',
      };
  }

  // Default fallback for unknown errors
  return {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'If the problem continues, please contact our support team.',
  };
}

/**
 * Get a simple user-friendly error message (just the message part)
 */
export function getUserFriendlyMessage(error: any): string {
  return getUserFriendlyError(error).message;
}

/**
 * Get a user-friendly error title
 */
export function getUserFriendlyTitle(error: any): string {
  return getUserFriendlyError(error).title;
}
