#!/usr/bin/env node

/**
 * Create Test User Script
 * Creates a verified test user directly in the database for testing
 */

const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');

// Load environment variables
config({ path: './apps/backend/.env' });

// Database schema (simplified)
const { pgTable, uuid, varchar, text, boolean, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('USER'),
  phone_number: varchar('phone_number', { length: 20 }),
  profile_image_url: text('profile_image_url'),
  is_verified: boolean('is_verified').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

async function createTestUser() {
  console.log('👤 Creating verified test user...\n');
  
  try {
    // Initialize database connection
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
      role: 'USER'
    };
    
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, testUser.email))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log('✅ User already exists');
      
      // Update to ensure user is verified
      await db
        .update(users)
        .set({ 
          is_verified: true,
          updated_at: new Date()
        })
        .where(eq(users.email, testUser.email));
      
      console.log('✅ User updated to verified status');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
      return;
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    
    // Create user
    console.log('💾 Creating user in database...');
    const newUser = await db
      .insert(users)
      .values({
        name: testUser.name,
        email: testUser.email,
        password_hash: passwordHash,
        role: testUser.role,
        is_verified: true, // Create as verified for testing
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('👤 User ID:', newUser[0]?.id);
    console.log('✅ Verified:', true);
    
    console.log('\n🎯 You can now use these credentials to test the authentication flow:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
    console.error('💡 Make sure the database is running and DATABASE_URL is correct');
  }
}

createTestUser();
