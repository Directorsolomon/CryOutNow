import bcrypt from 'bcrypt';
import db from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface User {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password?: string;
  displayName: string;
  photoURL?: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  photoURL?: string;
  password?: string;
}

export const createUser = async (userData: CreateUserDTO): Promise<User> => {
  const existingUser = await db('users').where('email', userData.email).first();
  if (existingUser) {
    throw new AppError('User already exists', 400, 'USER_EXISTS');
  }

  const user = {
    ...userData,
    password: userData.password ? await bcrypt.hash(userData.password, 10) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [newUser] = await db('users').insert(user).returning('*');
  return newUser;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const user = await db('users').where('id', id).first();
  return user || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = await db('users').where('email', email).first();
  return user || null;
};

export const updateUser = async (id: string, userData: UpdateUserDTO): Promise<User> => {
  const updateData = {
    ...userData,
    updatedAt: new Date(),
  };

  if (userData.password) {
    updateData.password = await bcrypt.hash(userData.password, 10);
  }

  const [updatedUser] = await db('users')
    .where('id', id)
    .update(updateData)
    .returning('*');

  if (!updatedUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
  const result = await db('users').where('id', id).delete();
  if (!result) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
};

export const validatePassword = async (user: User, password: string): Promise<boolean> => {
  if (!user.password) {
    return false;
  }
  return bcrypt.compare(password, user.password);
}; 