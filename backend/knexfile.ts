import { knexSnakeCaseMappers } from 'objection';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const baseConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cryoutnow',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './src/db/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/db/seeds',
  },
  ...knexSnakeCaseMappers(),
};

// Test specific configuration
const testConfig = {
  ...baseConfig,
  connection: {
    ...baseConfig.connection,
    database: 'cryoutnow_test',
  },
  pool: {
    min: 1,
    max: 5,
  },
};

// Production specific configuration
const productionConfig = {
  ...baseConfig,
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 20,
  },
  ssl: { rejectUnauthorized: false },
};

export const knexConfig = {
  development: baseConfig,
  test: testConfig,
  production: productionConfig,
}; 