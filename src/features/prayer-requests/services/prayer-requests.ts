/**
 * @file prayer-requests.ts
 * @description Service functions for managing prayer requests in Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  PrayerRequest, 
  CreatePrayerRequestData, 
  UpdatePrayerRequestData,
  PrayerRequestStatus,
} from '../types';

const COLLECTION = 'prayerRequests';

/**
 * Converts Firestore data to PrayerRequest type
 */
function convertFromFirestore(id: string, data: any): PrayerRequest {
  return {
    ...data,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
}

/**
 * Creates a new prayer request
 * @async
 * @function createPrayerRequest
 * @param {CreatePrayerRequestData} data - Prayer request data
 * @returns {Promise<string>} The ID of the created prayer request
 * @throws Will throw an error if the operation fails
 */
export async function createPrayerRequest(data: CreatePrayerRequestData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      prayerCount: 0,
      prayingUsers: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating prayer request:', error);
    throw new Error('Failed to create prayer request');
  }
}

/**
 * Retrieves a prayer request by ID
 * @async
 * @function getPrayerRequest
 * @param {string} id - Prayer request ID
 * @returns {Promise<PrayerRequest>} The prayer request data
 * @throws Will throw an error if the request doesn't exist or if the operation fails
 */
export async function getPrayerRequest(id: string): Promise<PrayerRequest> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Prayer request not found');
    }

    return convertFromFirestore(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Error fetching prayer request:', error);
    throw new Error('Failed to fetch prayer request');
  }
}

/**
 * Updates a prayer request
 * @async
 * @function updatePrayerRequest
 * @param {string} id - Prayer request ID
 * @param {UpdatePrayerRequestData} updates - Fields to update
 * @throws Will throw an error if the operation fails
 */
export async function updatePrayerRequest(
  id: string,
  updates: UpdatePrayerRequestData
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating prayer request:', error);
    throw new Error('Failed to update prayer request');
  }
}

/**
 * Deletes a prayer request
 * @async
 * @function deletePrayerRequest
 * @param {string} id - Prayer request ID
 * @throws Will throw an error if the operation fails
 */
export async function deletePrayerRequest(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    throw new Error('Failed to delete prayer request');
  }
}

/**
 * Records a user praying for a request
 * @async
 * @function recordPrayer
 * @param {string} requestId - Prayer request ID
 * @param {string} userId - User ID
 * @throws Will throw an error if the operation fails
 */
export async function recordPrayer(requestId: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, requestId);
    await updateDoc(docRef, {
      prayerCount: increment(1),
      prayingUsers: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error recording prayer:', error);
    throw new Error('Failed to record prayer');
  }
}

/**
 * Removes a user's prayer from a request
 * @async
 * @function removePrayer
 * @param {string} requestId - Prayer request ID
 * @param {string} userId - User ID
 * @throws Will throw an error if the operation fails
 */
export async function removePrayer(requestId: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, requestId);
    await updateDoc(docRef, {
      prayerCount: increment(-1),
      prayingUsers: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing prayer:', error);
    throw new Error('Failed to remove prayer');
  }
}

/**
 * Retrieves prayer requests for a user
 * @async
 * @function getUserPrayerRequests
 * @param {string} userId - User ID
 * @param {PrayerRequestStatus} [status] - Optional status filter
 * @returns {Promise<PrayerRequest[]>} Array of prayer requests
 * @throws Will throw an error if the operation fails
 */
export async function getUserPrayerRequests(
  userId: string,
  status?: PrayerRequestStatus
): Promise<PrayerRequest[]> {
  try {
    const constraints = [where('userId', '==', userId)];
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const q = query(
      collection(db, COLLECTION),
      ...constraints,
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  } catch (error) {
    console.error('Error fetching user prayer requests:', error);
    throw new Error('Failed to fetch prayer requests');
  }
}

/**
 * Retrieves public prayer requests
 * @async
 * @function getPublicPrayerRequests
 * @param {PrayerRequestStatus} [status] - Optional status filter
 * @param {number} [limit=10] - Number of requests to fetch
 * @returns {Promise<PrayerRequest[]>} Array of prayer requests
 * @throws Will throw an error if the operation fails
 */
export async function getPublicPrayerRequests(
  status?: PrayerRequestStatus,
  limit: number = 10
): Promise<PrayerRequest[]> {
  try {
    const constraints = [where('isPrivate', '==', false)];
    if (status) {
      constraints.push(where('status', '==', status));
    }

    const q = query(
      collection(db, COLLECTION),
      ...constraints,
      orderBy('createdAt', 'desc'),
      // Add limit here when implemented
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      convertFromFirestore(doc.id, doc.data())
    );
  } catch (error) {
    console.error('Error fetching public prayer requests:', error);
    throw new Error('Failed to fetch prayer requests');
  }
} 