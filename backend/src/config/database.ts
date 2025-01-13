import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cryoutnow',
  },
  pool: {
    min: 2,
    max: 10,
  },
});

export const connectDatabase = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default db; 