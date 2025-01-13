export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  prayerFrequency?: string;
  preferredTimes?: string[];
  languages?: string[];
  topics?: string[];
  denominationPreference?: string;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'answered';
  tags: string[];
  prayerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerChain {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  participants: Participant[];
  prayers: number;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  role: 'member' | 'admin';
  joinedAt: string;
  user?: User;
}

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  status: 'scheduled' | 'active' | 'completed';
  startTime: string;
  endTime?: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhoto?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: 'user' | 'prayer' | 'message';
  targetId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGuideline {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface EmailPreferences {
  dailyDigest: boolean;
  prayerReminders: boolean;
  groupUpdates: boolean;
  friendRequests: boolean;
  marketing: boolean;
}

export interface MetricType {
  id: string;
  name: string;
  value: number;
  period: string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
  updatedAt: string;
  friend?: User;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender?: User;
}

export interface MatchPreferences {
  prayerFrequency: 'daily' | 'weekly' | 'monthly';
  preferredTimes: string[];
  languages: string[];
  topics: string[];
  ageRange: '18-25' | '26-35' | '36-50' | '50+';
  gender: 'any' | 'same' | 'different';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  denominationPreference?: string;
}

export interface PrayerPartner {
  id: string;
  userId: string;
  partnerId: string;
  matchScore: number;
  status: 'suggested' | 'accepted' | 'rejected';
  createdAt: string;
  partner?: User;
} 
