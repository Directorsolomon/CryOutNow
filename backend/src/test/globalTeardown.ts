import { db } from '../db/connection';

export default async function globalTeardown() {
  try {
    const connection = await db.getConnection();
    
    // Roll back migrations
    await connection.migrate.rollback({
      directory: './src/db/migrations',
    });

    // Close database connection
    await connection.destroy();
  } catch (error) {
    console.error('Test teardown failed:', error);
    throw error;
  }
} 