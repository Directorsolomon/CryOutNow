import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { AppError } from '../middleware/error.middleware';

interface User {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  photo_url?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
  };
  token: string;
}

export class AuthService {
  private static generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  private static formatUserResponse(user: User): AuthResponse {
    const token = this.generateToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
      },
      token,
    };
  }

  static async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const connection = await db.getConnection();
    
    const existingUser = await connection('users').where({ email }).first();
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await connection('users')
      .insert({
        email,
        password_hash: passwordHash,
        display_name: displayName,
      })
      .returning(['id', 'email', 'display_name', 'photo_url']);

    if (!user) {
      throw new AppError('Failed to create user', 500);
    }

    return this.formatUserResponse(user as User);
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const connection = await db.getConnection();
    
    const user = await connection<User>('users').where({ email }).first();
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    return this.formatUserResponse(user);
  }

  static async handleGoogleAuth(profile: any): Promise<AuthResponse> {
    const connection = await db.getConnection();
    const email = profile.emails[0].value;
    
    let user = await connection<User>('users').where({ email }).first();

    if (!user) {
      const [newUser] = await connection('users')
        .insert({
          email,
          display_name: profile.displayName,
          photo_url: profile.photos[0]?.value,
          password_hash: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
        })
        .returning(['id', 'email', 'display_name', 'photo_url']);
      
      if (!newUser) {
        throw new AppError('Failed to create user', 500);
      }
      
      user = newUser as User;
    }

    return this.formatUserResponse(user);
  }

  static verifyToken(token: string): { id: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
} 