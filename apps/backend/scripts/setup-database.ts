#!/usr/bin/env bun

/**
 * Database Setup Script for Hamsoya Backend
 * 
 * This script:
 * - Generates database migrations
 * - Applies migrations to the database
 * - Creates initial indexes for performance
 * - Validates the database schema
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message: string) => log(`✅ ${message}`, 'green');
const logError = (message: string) => log(`❌ ${message}`, 'red');
const logInfo = (message: string) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message: string) => log(`⚠️  ${message}`, 'yellow');

class DatabaseSetup {
  private db: ReturnType<typeof drizzle>;
  private sql: ReturnType<typeof neon>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.sql = neon(databaseUrl);
    this.db = drizzle(this.sql, { schema });
  }

  async checkConnection() {
    try {
      logInfo('Checking database connection...');
      await this.sql`SELECT 1`;
      logSuccess('Database connection successful');
    } catch (error) {
      logError(`Database connection failed: ${error}`);
      throw error;
    }
  }

  async runMigrations() {
    try {
      logInfo('Running database migrations...');
      await migrate(this.db, { migrationsFolder: './drizzle' });
      logSuccess('Database migrations completed');
    } catch (error) {
      logError(`Migration failed: ${error}`);
      throw error;
    }
  }

  async createOptimizationIndexes() {
    try {
      logInfo('Creating performance optimization indexes...');

      // Additional indexes for better performance
      const indexes = [
        // User table optimizations
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified 
         ON users(email) WHERE is_verified = true`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_verified 
         ON users(role, is_verified)`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
         ON users(created_at DESC)`,

        // Refresh tokens optimizations
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_expires_at 
         ON refresh_tokens(expires_at) WHERE revoked_at IS NULL`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_user_active 
         ON refresh_tokens(user_id) WHERE revoked_at IS NULL`,

        // Password reset tokens optimizations
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_password_reset_expires 
         ON password_reset_tokens(expires_at) WHERE used_at IS NULL`,

        // Email verification tokens optimizations
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_verification_expires 
         ON email_verification_tokens(expires_at) WHERE used_at IS NULL`,

        // User sessions optimizations
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires 
         ON user_sessions(expires_at DESC)`,
        
        `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_last_accessed 
         ON user_sessions(last_accessed DESC)`,
      ];

      for (const indexSql of indexes) {
        try {
          await this.sql(indexSql);
          logSuccess(`Created index: ${indexSql.split('IF NOT EXISTS')[1]?.split('ON')[0]?.trim()}`);
        } catch (error) {
          // Ignore if index already exists
          if (!String(error).includes('already exists')) {
            logWarning(`Index creation warning: ${error}`);
          }
        }
      }

      logSuccess('Performance indexes created');
    } catch (error) {
      logError(`Index creation failed: ${error}`);
      throw error;
    }
  }

  async validateSchema() {
    try {
      logInfo('Validating database schema...');

      // Check if all tables exist
      const tables = ['users', 'refresh_tokens', 'password_reset_tokens', 'email_verification_tokens', 'user_sessions'];
      
      for (const table of tables) {
        const result = await this.sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `;
        
        if (!result[0]?.exists) {
          throw new Error(`Table ${table} does not exist`);
        }
      }

      // Check critical constraints
      const constraints = await this.sql`
        SELECT 
          tc.table_name, 
          tc.constraint_name, 
          tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
        ORDER BY tc.table_name, tc.constraint_type
      `;

      logInfo(`Found ${constraints.length} constraints`);
      
      // Validate specific constraints
      const requiredConstraints = [
        { table: 'users', type: 'PRIMARY KEY' },
        { table: 'users', type: 'UNIQUE' }, // email unique constraint
        { table: 'refresh_tokens', type: 'FOREIGN KEY' }, // user_id reference
        { table: 'password_reset_tokens', type: 'FOREIGN KEY' }, // user_id reference
        { table: 'email_verification_tokens', type: 'FOREIGN KEY' }, // user_id reference
        { table: 'user_sessions', type: 'FOREIGN KEY' }, // user_id reference
      ];

      for (const required of requiredConstraints) {
        const found = constraints.some(c => 
          c.table_name === required.table && c.constraint_type === required.type
        );
        
        if (!found) {
          logWarning(`Missing ${required.type} constraint on ${required.table}`);
        }
      }

      logSuccess('Schema validation completed');
    } catch (error) {
      logError(`Schema validation failed: ${error}`);
      throw error;
    }
  }

  async createInitialData() {
    try {
      logInfo('Creating initial data...');

      // Check if admin user exists
      const adminExists = await this.db
        .select()
        .from(schema.users)
        .where(sql`email = 'admin@hamsoya.com'`)
        .limit(1);

      if (adminExists.length === 0) {
        // Create admin user (password should be changed immediately)
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);

        await this.db.insert(schema.users).values({
          name: 'System Administrator',
          email: 'admin@hamsoya.com',
          password_hash: hashedPassword,
          role: 'ADMIN',
          is_verified: true,
        });

        logSuccess('Created initial admin user (email: admin@hamsoya.com)');
        logWarning('Please change the admin password immediately after first login!');
      } else {
        logInfo('Admin user already exists');
      }

      logSuccess('Initial data setup completed');
    } catch (error) {
      logError(`Initial data creation failed: ${error}`);
      throw error;
    }
  }

  async cleanupExpiredTokens() {
    try {
      logInfo('Cleaning up expired tokens...');

      const now = new Date();

      // Clean expired refresh tokens
      const expiredRefreshTokens = await this.db
        .delete(schema.refreshTokens)
        .where(sql`expires_at < ${now}`)
        .returning({ id: schema.refreshTokens.id });

      // Clean expired password reset tokens
      const expiredPasswordTokens = await this.db
        .delete(schema.passwordResetTokens)
        .where(sql`expires_at < ${now}`)
        .returning({ id: schema.passwordResetTokens.id });

      // Clean expired email verification tokens
      const expiredEmailTokens = await this.db
        .delete(schema.emailVerificationTokens)
        .where(sql`expires_at < ${now}`)
        .returning({ id: schema.emailVerificationTokens.id });

      // Clean expired user sessions
      const expiredSessions = await this.db
        .delete(schema.userSessions)
        .where(sql`expires_at < ${now}`)
        .returning({ id: schema.userSessions.id });

      logSuccess(`Cleaned up expired tokens:`);
      logInfo(`  - Refresh tokens: ${expiredRefreshTokens.length}`);
      logInfo(`  - Password reset tokens: ${expiredPasswordTokens.length}`);
      logInfo(`  - Email verification tokens: ${expiredEmailTokens.length}`);
      logInfo(`  - User sessions: ${expiredSessions.length}`);
    } catch (error) {
      logError(`Token cleanup failed: ${error}`);
      throw error;
    }
  }

  async getStatistics() {
    try {
      logInfo('Gathering database statistics...');

      const userCount = await this.db
        .select({ count: sql`count(*)` })
        .from(schema.users);

      const verifiedUserCount = await this.db
        .select({ count: sql`count(*)` })
        .from(schema.users)
        .where(sql`is_verified = true`);

      const activeSessionCount = await this.db
        .select({ count: sql`count(*)` })
        .from(schema.userSessions)
        .where(sql`expires_at > ${new Date()}`);

      log('\n📊 Database Statistics:', 'bright');
      logInfo(`Total Users: ${userCount[0]?.count || 0}`);
      logInfo(`Verified Users: ${verifiedUserCount[0]?.count || 0}`);
      logInfo(`Active Sessions: ${activeSessionCount[0]?.count || 0}`);
    } catch (error) {
      logError(`Statistics gathering failed: ${error}`);
    }
  }

  async runFullSetup() {
    log('\n🚀 Starting Hamsoya Database Setup\n', 'bright');

    try {
      await this.checkConnection();
      await this.runMigrations();
      await this.createOptimizationIndexes();
      await this.validateSchema();
      await this.createInitialData();
      await this.cleanupExpiredTokens();
      await this.getStatistics();

      log('\n✨ Database setup completed successfully!\n', 'bright');
      logSuccess('Your Hamsoya backend database is ready to use.');
    } catch (error) {
      log('\n❌ Database setup failed!\n', 'red');
      logError(`Error: ${error}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const setup = new DatabaseSetup();
  await setup.runFullSetup();
}

// Run setup
if (import.meta.main) {
  main().catch((error) => {
    log(`Database setup failed: ${error.message}`, 'red');
    process.exit(1);
  });
}
