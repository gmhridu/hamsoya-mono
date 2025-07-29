// Comprehensive error handling constants and utilities for OTP system

// OTP Error codes and their user-friendly messages
export const OTP_ERROR_MESSAGES = {
  // OTP-specific errors
  "OTP_EXPIRED": {
    title: "Code Expired",
    message: "Your verification code has expired. Please request a new one.",
    action: "Request New Code",
    severity: "warning" as const,
  },
  "OTP_INVALID": {
    title: "Invalid Code",
    message: "The verification code you entered is incorrect. Please check and try again.",
    action: "Try Again",
    severity: "error" as const,
  },
  "OTP_NOT_FOUND": {
    title: "Code Not Found",
    message: "No verification code found. Please request a new one.",
    action: "Request Code",
    severity: "warning" as const,
  },
  "OTP_ALREADY_VERIFIED": {
    title: "Already Verified",
    message: "This code has already been used. Please request a new one if needed.",
    action: "Request New Code",
    severity: "info" as const,
  },

  // Rate limiting errors
  "OTP_RATE_LIMIT": {
    title: "Too Many Requests",
    message: "Too many requests. Please wait 1 hour before requesting again.",
    action: "Wait and Retry",
    severity: "error" as const,
  },
  "OTP_MAX_ATTEMPTS": {
    title: "Account Locked",
    message: "Too many incorrect attempts. Your account is temporarily locked for 15 minutes.",
    action: "Wait 15 Minutes",
    severity: "error" as const,
  },
  "OTP_COOLDOWN": {
    title: "Please Wait",
    message: "Please wait before requesting another verification code.",
    action: "Wait",
    severity: "warning" as const,
  },

  // Network and system errors
  "NETWORK_ERROR": {
    title: "Connection Error",
    message: "Unable to connect to our servers. Please check your internet connection and try again.",
    action: "Check Connection",
    severity: "error" as const,
  },
  "TIMEOUT_ERROR": {
    title: "Request Timeout",
    message: "The request took too long to complete. Please try again.",
    action: "Try Again",
    severity: "warning" as const,
  },
  "INTERNAL_ERROR": {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    action: "Try Later",
    severity: "error" as const,
  },

  // Authentication errors
  "UNAUTHORIZED": {
    title: "Authentication Required",
    message: "You need to be logged in to perform this action.",
    action: "Log In",
    severity: "warning" as const,
  },
  "FORBIDDEN": {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    action: "Contact Support",
    severity: "error" as const,
  },

  // Validation errors
  "VALIDATION_ERROR": {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    action: "Correct Input",
    severity: "warning" as const,
  },
  "EMAIL_INVALID": {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
    action: "Check Email",
    severity: "warning" as const,
  },

  // Registration errors
  "USER_EXISTS": {
    title: "Account Exists",
    message: "An account with this email already exists. Please log in instead.",
    action: "Log In",
    severity: "info" as const,
  },
  "REGISTRATION_EXPIRED": {
    title: "Registration Expired",
    message: "Your registration session has expired. Please start the registration process again.",
    action: "Register Again",
    severity: "warning" as const,
  },

  // Default fallback
  "UNKNOWN_ERROR": {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again.",
    action: "Try Again",
    severity: "error" as const,
  },
} as const;

// Error severity levels
export type ErrorSeverity = "info" | "warning" | "error";

// Error information interface
export interface ErrorInfo {
  title: string;
  message: string;
  action: string;
  severity: ErrorSeverity;
}

// HTTP status code to error code mapping
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, keyof typeof OTP_ERROR_MESSAGES> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "OTP_NOT_FOUND",
  408: "TIMEOUT_ERROR",
  409: "USER_EXISTS",
  429: "OTP_RATE_LIMIT",
  500: "INTERNAL_ERROR",
  502: "NETWORK_ERROR",
  503: "INTERNAL_ERROR",
  504: "TIMEOUT_ERROR",
};

// Error parsing utilities
export function parseErrorCode(error: any): keyof typeof OTP_ERROR_MESSAGES {
  // Check for explicit error code
  if (error?.errorCode && error.errorCode in OTP_ERROR_MESSAGES) {
    return error.errorCode;
  }

  // Check for HTTP status code
  if (error?.statusCode && error.statusCode in HTTP_STATUS_TO_ERROR_CODE) {
    return HTTP_STATUS_TO_ERROR_CODE[error.statusCode];
  }

  // Parse error message for specific patterns
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('expired')) return "OTP_EXPIRED";
  if (message.includes('invalid') && message.includes('otp')) return "OTP_INVALID";
  if (message.includes('too many')) return "OTP_MAX_ATTEMPTS";
  if (message.includes('rate limit')) return "OTP_RATE_LIMIT";
  if (message.includes('cooldown')) return "OTP_COOLDOWN";
  if (message.includes('network') || message.includes('fetch')) return "NETWORK_ERROR";
  if (message.includes('timeout')) return "TIMEOUT_ERROR";
  if (message.includes('unauthorized')) return "UNAUTHORIZED";
  if (message.includes('forbidden')) return "FORBIDDEN";
  if (message.includes('already exists')) return "USER_EXISTS";
  if (message.includes('already verified')) return "OTP_ALREADY_VERIFIED";
  if (message.includes('not found')) return "OTP_NOT_FOUND";
  if (message.includes('registration') && message.includes('expired')) return "REGISTRATION_EXPIRED";

  return "UNKNOWN_ERROR";
}

// Get error information from error object
export function getErrorInfo(error: any): ErrorInfo {
  const errorCode = parseErrorCode(error);
  return OTP_ERROR_MESSAGES[errorCode];
}

// Format error for display
export function formatError(error: any): {
  title: string;
  message: string;
  action: string;
  severity: ErrorSeverity;
  remainingAttempts?: number;
  cooldownRemaining?: number;
} {
  const errorInfo = getErrorInfo(error);
  
  // Add additional context if available
  let message = errorInfo.message;
  
  if (error?.remainingAttempts !== undefined) {
    message += ` ${error.remainingAttempts} attempts remaining.`;
  }
  
  if (error?.cooldownRemaining !== undefined && error.cooldownRemaining > 0) {
    const minutes = Math.floor(error.cooldownRemaining / 60);
    const seconds = error.cooldownRemaining % 60;
    const timeStr = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
    message += ` Please wait ${timeStr} before trying again.`;
  }

  return {
    ...errorInfo,
    message,
    remainingAttempts: error?.remainingAttempts,
    cooldownRemaining: error?.cooldownRemaining,
  };
}

// Toast notification helpers
export const TOAST_STYLES = {
  info: {
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: "ℹ️",
  },
  warning: {
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "⚠️",
  },
  error: {
    className: "border-red-200 bg-red-50 text-red-800",
    icon: "❌",
  },
} as const;

// Retry strategies
export const RETRY_STRATEGIES = {
  immediate: { delay: 0, maxAttempts: 1 },
  short: { delay: 1000, maxAttempts: 3 },
  medium: { delay: 5000, maxAttempts: 2 },
  long: { delay: 30000, maxAttempts: 1 },
} as const;

// Get retry strategy based on error type
export function getRetryStrategy(errorCode: keyof typeof OTP_ERROR_MESSAGES) {
  switch (errorCode) {
    case "NETWORK_ERROR":
    case "TIMEOUT_ERROR":
      return RETRY_STRATEGIES.short;
    
    case "INTERNAL_ERROR":
      return RETRY_STRATEGIES.medium;
    
    case "OTP_RATE_LIMIT":
    case "OTP_MAX_ATTEMPTS":
      return RETRY_STRATEGIES.long;
    
    default:
      return RETRY_STRATEGIES.immediate;
  }
}

// Error context for debugging
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
  userAgent?: string;
  url?: string;
}

// Enhanced error logging
export function logError(error: any, context?: ErrorContext) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    errorCode: parseErrorCode(error),
    context: {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context,
    },
  };

  console.error('Enhanced Error Log:', errorInfo);

  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error tracking service
    // errorTrackingService.captureError(errorInfo);
  }
}
