import type { PayloadAction } from '@reduxjs/toolkit';

// Entity Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  roles: string[];
  preferences: UserPreferences;
}

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'answered';
  isUrgent: boolean;
  categories: string[];
  tags: string[];
  prayerCount: number;
  commentCount: number;
  likeCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface MetricType {
  name: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// State Types
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

export interface AuthState extends AsyncState {
  user: User | null;
  token: string | null;
}

export interface MessagesState extends AsyncState {
  conversations: Conversation[];
  currentConversation: {
    details: Conversation | null;
    messages: Message[];
    hasMore: boolean;
  } | null;
}

export interface PrayerFeedState extends AsyncState {
  items: PrayerRequest[];
  page: number;
  hasMore: boolean;
  filters: {
    sortBy: 'recent' | 'popular' | 'unanswered';
    status: 'all' | 'open' | 'answered';
    categories: string[];
    tags: string[];
    onlyFollowing: boolean;
    searchTerm: string;
  };
}

export interface AnalyticsState extends AsyncState {
  prayerMetrics: MetricType[];
  communityMetrics: MetricType[];
  timeRange: 'day' | 'week' | 'month' | 'year';
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Store Types
export type RootState = {
  auth: AuthState;
  messages: MessagesState;
  prayerFeed: PrayerFeedState;
  analytics: AnalyticsState;
}

export type AppDispatch = (action: PayloadAction<any>) => void; 
