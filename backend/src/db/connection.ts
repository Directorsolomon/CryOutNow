import knex, { Knex } from 'knex';
import { knexConfig } from '../../knexfile';
import { AppError } from '../middleware/error.middleware';

class Database {
  private static instance: Database;
  private _knex: Knex | null = null;
  private environment = process.env.NODE_ENV || 'development';

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async getConnection(): Promise<Knex> {
    if (!this._knex) {
      const config = knexConfig[this.environment as keyof typeof knexConfig];
      this._knex = knex(config);
      
      // Test the connection
      try {
        await this._knex.raw('SELECT 1');
        console.log('Database connected successfully');
      } catch (error) {
        console.error('Database connection failed:', error);
        throw new AppError('Database connection failed', 500, 'DB_CONNECTION_ERROR');
      }
    }
    return this._knex;
  }

  async closeConnection(): Promise<void> {
    if (this._knex) {
      await this._knex.destroy();
      this._knex = null;
    }
  }
}

export const db = Database.getInstance(); 