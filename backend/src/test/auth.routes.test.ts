import request from 'supertest';
import app from '../app';
import { db } from '../db/connection';
import bcrypt from 'bcrypt';

// Mock the database module
jest.mock('../db/connection', () => ({
  db: {
    getConnection: jest.fn().mockResolvedValue({
      del: jest.fn(),
      insert: jest.fn(),
      where: jest.fn(),
    }),
  },
}));

describe('Auth Routes', () => {
  let mockDb: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDb = await db.getConnection();
    mockDb.del.mockResolvedValue(true);
  });

  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      mockDb.where.mockReturnValue({ first: jest.fn().mockResolvedValue(null) });
      mockDb.insert.mockReturnValue({ returning: jest.fn().mockResolvedValue([{
        id: '1',
        email: 'test@example.com',
        display_name: 'Test User',
      }]) });
    });

    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          displayName: 'Test User',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('displayName', 'Test User');
      
      // Check cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 400 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          displayName: 'Test User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      mockDb.where.mockReturnValue({ first: jest.fn().mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        display_name: 'Test User',
        password_hash: bcrypt.hashSync('Password123!', 10),
      }) });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      
      // Check cookie
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the auth cookie', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0]).toContain('token=;');
    });
  });
}); 