import { db } from '../db/connection';
import { config } from '../config';

export default async function globalSetup() {
  try {
    // Initialize database connection
    const connection = await db.getConnection();

    // Run migrations
    await connection.migrate.latest({
      directory: './src/db/migrations',
    });

    // Clean up test data
    await connection('users').del();
    await connection('prayer_chains').del();
    await connection('prayer_chain_members').del();
    await connection('prayers').del();

  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
} 