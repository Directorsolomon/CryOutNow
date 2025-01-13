/**
 * @file types/index.ts
 * @description Type definitions for prayer requests
 */

/**
 * Prayer request status
 * @enum {string}
 */
export enum PrayerRequestStatus {
  ACTIVE = 'active',
  ANSWERED = 'answered',
  ARCHIVED = 'archived',
}

/**
 * Prayer request data structure
 * @interface PrayerRequest
 */
export interface PrayerRequest {
  /** Unique identifier */
  id: string;
  /** User who created the request */
  userId: string;
  /** Title of the prayer request */
  title: string;
  /** Detailed description */
  description: string;
  /** Current status */
  status: PrayerRequestStatus;
  /** Whether the request is private */
  isPrivate: boolean;
  /** Number of people praying */
  prayerCount: number;
  /** Users who are praying */
  prayingUsers: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Optional tags/categories */
  tags?: string[];
  /** Optional scripture references */
  scriptureReferences?: string[];
}

/**
 * Data for creating a new prayer request
 * @interface CreatePrayerRequestData
 */
export type CreatePrayerRequestData = Omit<
  PrayerRequest,
  'id' | 'prayerCount' | 'prayingUsers' | 'createdAt' | 'updatedAt'
>;

/**
 * Data for updating a prayer request
 * @interface UpdatePrayerRequestData
 */
export type UpdatePrayerRequestData = Partial<
  Omit<PrayerRequest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>; 