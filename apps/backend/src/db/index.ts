import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create the connection
export const createDbConnection = (databaseUrl: string) => {
  console.log(
    '🔗 Creating database connection with URL:',
    databaseUrl.replace(/:[^:@]*@/, ':***@')
  );
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

// Test database connection
export const testDbConnection = async (databaseUrl: string) => {
  try {
    console.log('🧪 Testing database connection...');
    console.log('🔗 Database URL (masked):', databaseUrl.replace(/:[^:@]*@/, ':***@'));
    console.log('🔗 Database URL length:', databaseUrl.length);
    console.log('🔗 Database URL starts with:', databaseUrl.substring(0, 20));

    const sql = neon(databaseUrl);
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection test successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      path: (error as any)?.path,
      code: (error as any)?.code,
      errno: (error as any)?.errno,
    });
    return false;
  }
};

// Default connection for development
export const getDb = (env?: any) => {
  const databaseUrl = env?.DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔍 Using DATABASE_URL from:', env?.DATABASE_URL ? 'env parameter' : 'process.env');

  return createDbConnection(databaseUrl);
};

// Export schema for use in other files
export * from './schema';
