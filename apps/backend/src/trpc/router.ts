import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { ProductService } from '../services/product.service';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyOTPSchema,
} from '../types/auth';
import type { Context } from './context';

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Base router and procedure
export const router = t.router;
export const publicProcedure = t.procedure;

// Authenticated procedure
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        ...ctx.auth,
        user: ctx.auth.user, // TypeScript knows user is not null here
      },
    },
  });
});

// Admin procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.auth.user?.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({ ctx });
});

// Seller procedure
export const sellerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.auth.user?.role !== 'SELLER' && ctx.auth.user?.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Seller access required',
    });
  }

  return next({ ctx });
});

// Auth router
const authRouter = router({
  // Register
  register: publicProcedure.input(RegisterSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.register(input);
  }),

  // Login
  login: publicProcedure.input(LoginSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.login(input);
  }),

  // Verify OTP
  verify: publicProcedure.input(VerifyOTPSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.verifyOTP(input);
  }),

  // Resend verification OTP
  resendVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const authService = new AuthService(ctx.env);
      return await authService.sendVerificationOTP(input.email);
    }),

  // Get OTP cooldown status
  getCooldownStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const authService = new AuthService(ctx.env);
      return await authService.getOTPCooldownStatus(input.email);
    }),

  // Forgot password
  forgotPassword: publicProcedure.input(ForgotPasswordSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.forgotPassword(input);
  }),

  // Verify forgot password OTP
  verifyForgotPassword: publicProcedure.input(VerifyOTPSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.verifyForgotPasswordOTP(input);
  }),

  // Reset password
  resetPassword: publicProcedure.input(ResetPasswordSchema).mutation(async ({ input, ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.resetPassword(input);
  }),

  // Refresh token
  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const authService = new AuthService(ctx.env);
      return await authService.refreshToken(input.refreshToken);
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const authService = new AuthService(ctx.env);
    return await authService.getUserProfile(ctx.auth.user.id);
  }),

  // Logout (invalidate refresh token)
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // In a real implementation, you would invalidate the refresh token
    // For now, just return success
    return { message: 'Logged out successfully' };
  }),
});

// User router
const userRouter = router({
  // Get user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.userService.getUserById(ctx.auth.user.id);
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phone_number: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.userService.updateUser(ctx.auth.user.id, input);
    }),

  // Get user stats (admin only)
  stats: adminProcedure.query(async ({ ctx }) => {
    return await ctx.userService.getUserStats();
  }),
});

// Health router
const healthRouter = router({
  check: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'hamsoya-backend',
    };
  }),
});

// Product router
const productRouter = router({
  // Get all products with filters
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        inStock: z.boolean().optional(),
        sortBy: z.enum(['name', 'price', 'newest', 'rating']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.number().int().positive().max(100).optional(),
        offset: z.number().int().min(0).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const productService = new ProductService(ctx.env);
      return await productService.getProducts(input);
    }),

  // Get product by ID
  byId: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    const productService = new ProductService(ctx.env);
    const product = await productService.getProductById(input.id);
    if (!product) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Product not found',
      });
    }
    return product;
  }),

  // Get featured products
  featured: publicProcedure
    .input(z.object({ limit: z.number().int().positive().max(50).optional() }))
    .query(async ({ input, ctx }) => {
      const productService = new ProductService(ctx.env);
      return await productService.getFeaturedProducts(input.limit);
    }),

  // Get products by category
  byCategory: publicProcedure
    .input(
      z.object({
        categorySlug: z.string(),
        limit: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const productService = new ProductService(ctx.env);
      return await productService.getProductsByCategory(input.categorySlug, input.limit);
    }),

  // Search products
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const productService = new ProductService(ctx.env);
      return await productService.searchProducts(input.query, input.limit);
    }),

  // Get product reviews
  reviews: publicProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const productService = new ProductService(ctx.env);
      return await productService.getProductReviews(input.productId);
    }),
});

// Category router
const categoryRouter = router({
  // Get all categories
  list: publicProcedure.query(async ({ ctx }) => {
    const productService = new ProductService(ctx.env);
    return await productService.getCategories();
  }),

  // Get category by slug
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input, ctx }) => {
    const productService = new ProductService(ctx.env);
    const category = await productService.getCategoryBySlug(input.slug);
    if (!category) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Category not found',
      });
    }
    return category;
  }),
});

// Main app router
export const appRouter = router({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  products: productRouter,
  categories: categoryRouter,
});

export type AppRouter = typeof appRouter;
