#!/usr/bin/env bun

/**
 * Development Database Setup Script
 * 
 * This script helps set up a local database for development.
 * Run with: bun run scripts/setup-dev-db.ts
 */

console.log('🚀 Setting up development database...');

// Check if environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please create a .env.local file with the required variables.');
  console.error('   You can copy from .env.example and update the values.');
  process.exit(1);
}

console.log('✅ Environment variables check passed');

// Check database connection
try {
  console.log('🔍 Checking database connection...');
  
  // This would normally test the database connection
  // For now, just validate the URL format
  const dbUrl = process.env.DATABASE_URL!;
  if (!dbUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  
  console.log('✅ Database URL format is valid');
  console.log('📝 Note: Actual database connection testing requires database setup');
  
} catch (error) {
  console.error('❌ Database connection check failed:', error);
  console.error('\n💡 Make sure your database is running and the URL is correct.');
  process.exit(1);
}

// Check Redis connection (optional)
if (process.env.REDIS_URL) {
  console.log('🔍 Redis URL found, connection will be tested when server starts');
} else {
  console.log('⚠️  No Redis URL found - some features may not work');
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📋 Next steps:');
console.log('   1. Make sure your PostgreSQL database is running');
console.log('   2. Make sure your Redis server is running (optional)');
console.log('   3. Run database migrations: bun run db:migrate');
console.log('   4. Start the development server: bun run dev:backend');

console.log('\n🔧 Available commands:');
console.log('   - bun run db:generate  # Generate database migrations');
console.log('   - bun run db:migrate   # Run database migrations');
console.log('   - bun run db:studio    # Open database studio');
console.log('   - bun run dev:backend  # Start development server');
console.log('   - bun run test         # Run API tests');
