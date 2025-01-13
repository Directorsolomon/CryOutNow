/**
 * @file user.ts
 * @description Service functions for managing user data in Firestore
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * User profile data structure
 * @interface UserProfile
 */
export interface UserProfile {
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string;
  /** URL to user's profile photo */
  photoURL: string;
  /** Timestamp when the profile was created */
  createdAt: Date;
  /** Timestamp when the profile was last updated */
  updatedAt: Date;
}

/**
 * Creates or updates a user profile in Firestore
 * @async
 * @function createUserProfile
 * @param {string} userId - The user's unique identifier
 * @param {Partial<UserProfile>} data - The user profile data to save
 * @throws Will throw an error if the operation fails
 */
export async function createUserProfile(
  userId: string, 
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new profile
      await setDoc(userRef, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing profile
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw new Error('Failed to save user profile');
  }
}

/**
 * Retrieves a user profile from Firestore
 * @async
 * @function getUserProfile
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<UserProfile>} The user's profile data
 * @throws Will throw an error if the profile doesn't exist or if the operation fails
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const data = userDoc.data() as UserProfile;
    return {
      ...data,
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Updates specific fields in a user's profile
 * @async
 * @function updateUserProfile
 * @param {string} userId - The user's unique identifier
 * @param {Partial<UserProfile>} updates - The fields to update
 * @throws Will throw an error if the operation fails
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
} 