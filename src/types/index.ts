export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roles?: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string[];
  status: 'open' | 'answered';
  prayerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerChain {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  participants: string[];
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  hostId: string;
  participants: {
    id: string;
    status: 'joined' | 'left' | 'pending';
  }[];
  startTime: string;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  maxParticipants: number;
  prayerTopics: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'user' | 'prayer_request' | 'comment' | 'group';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface Guideline {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'prayer' | 'community' | 'content';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'prayer' | 'group' | 'system' | 'friend';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface EmailPreferences {
  userId: string;
  prayerNotifications: boolean;
  groupNotifications: boolean;
  friendNotifications: boolean;
  systemNotifications: boolean;
  verified: boolean;
  updatedAt: string;
}

export interface MetricType {
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ExportableMetrics {
  userMetrics: Record<string, MetricType>;
  prayerMetrics: Record<string, MetricType>;
  communityMetrics: Record<string, MetricType>;
} 
