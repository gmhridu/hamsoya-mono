export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errorCode?: string;
  timestamp: string;
  statusCode?: number;
}

export interface OTPErrorResponse extends ApiResponse {
  success: false;
  errorCode: string;
  remainingAttempts?: number;
  lockDuration?: number;
  userFriendlyMessage: string;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (
  error: string,
  message?: string,
  statusCode?: number,
  errorCode?: string
): ApiResponse => ({
  success: false,
  error,
  message,
  errorCode,
  statusCode,
  timestamp: new Date().toISOString(),
});

export const otpErrorResponse = (
  errorCode: string,
  userFriendlyMessage: string,
  statusCode: number,
  remainingAttempts?: number,
  lockDuration?: number
): OTPErrorResponse => ({
  success: false,
  error: userFriendlyMessage,
  errorCode,
  userFriendlyMessage,
  remainingAttempts,
  lockDuration,
  statusCode,
  timestamp: new Date().toISOString(),
});

export const validationErrorResponse = (
  errors: Array<{ field: string; message: string }>
): ApiResponse => ({
  success: false,
  error: 'Validation Error',
  data: { errors },
  timestamp: new Date().toISOString(),
});
