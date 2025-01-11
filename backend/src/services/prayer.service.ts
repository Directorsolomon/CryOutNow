import { db } from '../db/connection';
import { AppError } from '../middleware/error.middleware';

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags?: string[];
  status: 'active' | 'answered';
  answerNote?: string;
  prayerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getPrayerRequests = async (): Promise<PrayerRequest[]> => {
  const connection = await db.getConnection();
  return connection('prayer_requests')
    .select('*')
    .orderBy('created_at', 'desc');
};

export const getPrayerRequest = async (id: string): Promise<PrayerRequest | null> => {
  const connection = await db.getConnection();
  const request = await connection('prayer_requests')
    .where({ id })
    .first();
  return request || null;
};

export const createPrayerRequest = async (data: Omit<PrayerRequest, 'id' | 'prayerCount' | 'createdAt' | 'updatedAt'>): Promise<PrayerRequest> => {
  const connection = await db.getConnection();
  const [request] = await connection('prayer_requests')
    .insert({
      ...data,
      prayer_count: 0,
      status: 'active',
    })
    .returning('*');

  if (!request) {
    throw new AppError('Failed to create prayer request', 500);
  }

  return request;
};

export const updatePrayerRequest = async (
  id: string,
  userId: string,
  data: Partial<PrayerRequest>
): Promise<PrayerRequest> => {
  const connection = await db.getConnection();
  const request = await connection('prayer_requests')
    .where({ id })
    .first();

  if (!request) {
    throw new AppError('Prayer request not found', 404);
  }

  if (request.userId !== userId) {
    throw new AppError('Not authorized to update this prayer request', 403);
  }

  const [updatedRequest] = await connection('prayer_requests')
    .where({ id })
    .update(data)
    .returning('*');

  if (!updatedRequest) {
    throw new AppError('Failed to update prayer request', 500);
  }

  return updatedRequest;
};

export const deletePrayerRequest = async (id: string, userId: string): Promise<void> => {
  const connection = await db.getConnection();
  const request = await connection('prayer_requests')
    .where({ id })
    .first();

  if (!request) {
    throw new AppError('Prayer request not found', 404);
  }

  if (request.userId !== userId) {
    throw new AppError('Not authorized to delete this prayer request', 403);
  }

  await connection('prayer_requests')
    .where({ id })
    .del();
}; 