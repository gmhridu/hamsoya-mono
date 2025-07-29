import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password_hash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('USER'), // USER, SELLER, ADMIN
    phone_number: varchar('phone_number', { length: 20 }),
    profile_image_url: text('profile_image_url'), // ImageKit URL for profile image
    is_verified: boolean('is_verified').notNull().default(false),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    emailIdx: index('email_idx').on(table.email),
    roleIdx: index('role_idx').on(table.role),
  })
);

// Refresh tokens table for JWT management
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token_hash: text('token_hash').notNull(),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    revoked_at: timestamp('revoked_at'),
  },
  table => ({
    userIdIdx: index('refresh_tokens_user_id_idx').on(table.user_id),
    tokenHashIdx: index('refresh_tokens_token_hash_idx').on(table.token_hash),
  })
);

// Password reset tokens table
export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token_hash: text('token_hash').notNull(),
    expires_at: timestamp('expires_at').notNull(),
    used_at: timestamp('used_at'),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('password_reset_tokens_user_id_idx').on(table.user_id),
    tokenHashIdx: index('password_reset_tokens_token_hash_idx').on(table.token_hash),
  })
);

// Email verification tokens table
export const emailVerificationTokens = pgTable(
  'email_verification_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token_hash: text('token_hash').notNull(),
    expires_at: timestamp('expires_at').notNull(),
    used_at: timestamp('used_at'),
    created_at: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('email_verification_tokens_user_id_idx').on(table.user_id),
    tokenHashIdx: index('email_verification_tokens_token_hash_idx').on(table.token_hash),
  })
);

// User sessions table for tracking active sessions
export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    session_token: text('session_token').notNull().unique(),
    ip_address: varchar('ip_address', { length: 45 }),
    user_agent: text('user_agent'),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    last_accessed: timestamp('last_accessed').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('user_sessions_user_id_idx').on(table.user_id),
    sessionTokenIdx: index('user_sessions_session_token_idx').on(table.session_token),
  })
);

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2).max(255),
  role: z.enum(['USER', 'SELLER', 'ADMIN']),
  phone_number: z.string().optional(),
  profile_image_url: z.string().url().optional(),
});

export const selectUserSchema = createSelectSchema(users);

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);
export const selectRefreshTokenSchema = createSelectSchema(refreshTokens);

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens);
export const selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens);
export const selectEmailVerificationTokenSchema = createSelectSchema(emailVerificationTokens);

export const insertUserSessionSchema = createInsertSchema(userSessions);
export const selectUserSessionSchema = createSelectSchema(userSessions);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

// Categories table
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    image: text('image'),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    nameIdx: index('categories_name_idx').on(table.name),
    slugIdx: index('categories_slug_idx').on(table.slug),
  })
);

// Products table
export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    price: integer('price').notNull(), // Price in cents/paisa
    original_price: integer('original_price'), // Original price for discounts
    category_id: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    images: jsonb('images').$type<string[]>().notNull().default([]),
    tags: jsonb('tags').$type<string[]>().default([]),
    weight: varchar('weight', { length: 50 }),
    origin: varchar('origin', { length: 100 }),
    benefits: jsonb('benefits').$type<string[]>().default([]),
    in_stock: boolean('in_stock').notNull().default(true),
    stock_quantity: integer('stock_quantity').default(0),
    featured: boolean('featured').notNull().default(false),
    is_active: boolean('is_active').notNull().default(true),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    nameIdx: index('products_name_idx').on(table.name),
    categoryIdx: index('products_category_idx').on(table.category_id),
    featuredIdx: index('products_featured_idx').on(table.featured),
    activeIdx: index('products_active_idx').on(table.is_active),
  })
);

// Reviews table
export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(), // 1-5 stars
    comment: text('comment'),
    is_verified: boolean('is_verified').notNull().default(false),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    productIdx: index('reviews_product_idx').on(table.product_id),
    userIdx: index('reviews_user_idx').on(table.user_id),
    ratingIdx: index('reviews_rating_idx').on(table.rating),
  })
);

// Zod schemas for new tables
export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export const selectCategorySchema = createSelectSchema(categories);

export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().int().positive(),
  original_price: z.number().int().positive().optional(),
  images: z.array(z.string().url()),
  tags: z.array(z.string()).optional(),
  weight: z.string().optional(),
  origin: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  stock_quantity: z.number().int().min(0).optional(),
});

export const selectProductSchema = createSelectSchema(products);

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const selectReviewSchema = createSelectSchema(reviews);

// Type exports for new tables
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
