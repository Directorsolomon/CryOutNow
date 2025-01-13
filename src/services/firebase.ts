import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Types
export interface PrayerRequest {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  userLikes?: string[]; // Array of user IDs who liked this prayer request
}

export interface Comment {
  id?: string;
  text: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile Operations
export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  const now = new Date();
  await setDoc(userRef, {
    ...data,
    id: userId,
    createdAt: now,
    updatedAt: now,
  });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as UserProfile : null;
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date(),
  });
};

// Prayer Request Operations
export const createPrayerRequest = async (data: Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt' | 'likes'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to create a prayer request');

  const prayerRequestsRef = collection(db, 'prayerRequests');
  const now = new Date();
  
  return addDoc(prayerRequestsRef, {
    ...data,
    userId: user.uid,
    createdAt: now,
    updatedAt: now,
    likes: 0,
    userLikes: [],
  });
};

export const getPrayerRequest = async (requestId: string): Promise<PrayerRequest | null> => {
  const requestRef = doc(db, 'prayerRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  return requestSnap.exists() ? { id: requestSnap.id, ...requestSnap.data() } as PrayerRequest : null;
};

export const updatePrayerRequest = async (requestId: string, data: Partial<PrayerRequest>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to update a prayer request');

  const requestRef = doc(db, 'prayerRequests', requestId);
  const request = await getDoc(requestRef);
  
  if (!request.exists()) throw new Error('Prayer request not found');
  if (request.data().userId !== user.uid) throw new Error('Not authorized to update this prayer request');

  await updateDoc(requestRef, {
    ...data,
    updatedAt: new Date(),
  });
};

export const deletePrayerRequest = async (requestId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to delete a prayer request');

  const requestRef = doc(db, 'prayerRequests', requestId);
  const request = await getDoc(requestRef);
  
  if (!request.exists()) throw new Error('Prayer request not found');
  if (request.data().userId !== user.uid) throw new Error('Not authorized to delete this prayer request');

  await deleteDoc(requestRef);
};

export const getRecentPrayerRequests = async (limit: number = 10) => {
  const q = query(
    collection(db, 'prayerRequests'),
    orderBy('createdAt', 'desc'),
    limit(limit)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PrayerRequest[];
};

export const getUserPrayerRequests = async (userId: string) => {
  const q = query(
    collection(db, 'prayerRequests'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PrayerRequest[];
};

// Comment Operations
export const addComment = async (requestId: string, text: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to comment');

  const commentsRef = collection(db, 'prayerRequests', requestId, 'comments');
  const now = new Date();
  
  return addDoc(commentsRef, {
    text,
    userId: user.uid,
    createdAt: now,
    updatedAt: now,
  });
};

export const getComments = async (requestId: string) => {
  const commentsRef = collection(db, 'prayerRequests', requestId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
};

// Like Operations
export const toggleLike = async (requestId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be authenticated to like a prayer request');

  const requestRef = doc(db, 'prayerRequests', requestId);
  const request = await getDoc(requestRef);
  
  if (!request.exists()) throw new Error('Prayer request not found');
  
  const data = request.data();
  const userLikes = data.userLikes || [];
  const hasLiked = userLikes.includes(user.uid);

  if (hasLiked) {
    // Unlike
    await updateDoc(requestRef, {
      likes: data.likes - 1,
      userLikes: userLikes.filter((id: string) => id !== user.uid),
    });
  } else {
    // Like
    await updateDoc(requestRef, {
      likes: data.likes + 1,
      userLikes: [...userLikes, user.uid],
    });
  }
}; 
