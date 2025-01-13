import { User } from './index';
import { PrayerRequest } from './index';
import { GroupSession } from './index';

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'member' | 'admin';
  joined_at: string;
  user?: User;
}

export interface PrayerGroup {
  id: string;
  name: string;
  description: string;
  photo_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
  prayerRequests?: PrayerRequest[];
  sessions?: GroupSession[];
  privacy: 'public' | 'private';
  tags: string[];
  member_count: number;
} 
