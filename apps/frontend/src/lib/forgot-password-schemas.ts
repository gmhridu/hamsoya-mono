import { z } from 'zod';

// Forgot Password Email Schema
export const ForgotPasswordEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// OTP Verification Schema
export const ForgotPasswordOTPSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

// Reset Password Schema
export const ResetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Type exports
export type ForgotPasswordEmailData = z.infer<typeof ForgotPasswordEmailSchema>;
export type ForgotPasswordOTPData = z.infer<typeof ForgotPasswordOTPSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
