import { AuthService } from '../services/auth.service';
import { db } from '../db/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock the database module
jest.mock('../db/connection', () => {
  const mockFirst = jest.fn();
  const mockReturning = jest.fn();
  const mockWhere = jest.fn();
  const mockInsert = jest.fn();

  mockWhere.mockReturnValue({ first: mockFirst });
  mockInsert.mockReturnValue({ returning: mockReturning });

  const mockConnection = {
    where: mockWhere,
    insert: mockInsert,
  };

  return {
    db: {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
    },
  };
});
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let mockConnection: any;
  let mockFirst: jest.Mock;
  let mockReturning: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConnection = await db.getConnection();
    mockFirst = mockConnection.where().first;
    mockReturning = mockConnection.insert().returning;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        display_name: 'Test User',
        photo_url: null,
      };

      mockFirst.mockResolvedValue(null);
      mockReturning.mockResolvedValue([mockUser]);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await AuthService.register('test@example.com', 'password123', 'Test User');

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
        },
        token: 'mockToken',
      });
    });

    it('should throw error if email already exists', async () => {
      mockFirst.mockResolvedValue({ id: '1' });

      await expect(
        AuthService.register('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        display_name: 'Test User',
        password_hash: 'hashedPassword',
        photo_url: null,
      };

      mockFirst.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      const result = await AuthService.login('test@example.com', 'password123');

      expect(result).toEqual({
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: null,
        },
        token: 'mockToken',
      });
    });

    it('should throw error if user not found', async () => {
      mockFirst.mockResolvedValue(null);

      await expect(
        AuthService.login('test@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
      };

      mockFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', () => {
      const mockDecodedToken = { id: '1' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

      const result = AuthService.verifyToken('validToken');
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => AuthService.verifyToken('invalidToken')).toThrow('Invalid token');
    });
  });
}); 