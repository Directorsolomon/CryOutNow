import { ThunkAction, Action, PayloadAction } from '@reduxjs/toolkit';
import { User, PrayerRequest, GroupSession, Report, Guideline, Notification, EmailPreferences, MetricType } from './index';

// Common Types
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// State Types
export interface AsyncState {
  loading: boolean;
  error: string | null;
}

// Auth State
export interface AuthState extends AsyncState {
  user: User | null;
  token: string | null;
}

// Messages State
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhotoURL?: string;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface MessagesState extends AsyncState {
  conversations: Conversation[];
  currentConversation: {
    messages: Message[];
    hasMore: boolean;
    loading: boolean;
  };
}

// Prayer Feed State
export interface PrayerFeedState extends AsyncState {
  items: PrayerRequest[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  selectedTags: string[];
  sortBy: 'recent' | 'popular' | 'unanswered';
  filters: {
    answered: boolean | null;
    sortBy: 'recent' | 'popular' | 'unanswered';
    tags: string[];
  };
}

// Group Sessions State
export interface Participant {
  id: string;
  userId: string;
  displayName: string;
  role: 'host' | 'participant';
}

export interface GroupSessionsState extends AsyncState {
  sessions: GroupSession[];
  currentSession: {
    details: GroupSession | null;
    participants: Participant[];
  };
}

// Moderation State
export interface ModerationState extends AsyncState {
  reports: Report[];
  guidelines: Guideline[];
}

// Notifications State
export interface NotificationsState extends AsyncState {
  items: Notification[];
  unreadCount: number;
  emailPreferences: EmailPreferences;
  pushEnabled: boolean;
}

// Analytics State
export interface AnalyticsState extends AsyncState {
  userMetrics: MetricType[];
  prayerChainMetrics: MetricType[];
  prayerRequestMetrics: MetricType[];
  communityMetrics: MetricType[];
  timeRange: 'day' | 'week' | 'month' | 'year';
}

// Root State
export interface RootState {
  auth: AuthState;
  messages: MessagesState;
  prayerFeed: PrayerFeedState;
  groupSessions: GroupSessionsState;
  moderation: ModerationState;
  notifications: NotificationsState;
  analytics: AnalyticsState;
}

// Redux Toolkit Types
export type AppDispatch = (action: Action | AppThunk) => Promise<void>;

// Helper Types for Redux Toolkit Actions
export type AsyncThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type AsyncThunkPayload<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type AsyncThunkResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type AsyncThunkError = {
  message: string;
  code?: string | number;
};

// Typed Action Creators
export type TypedPayloadAction<T> = PayloadAction<T, string, never, never>;
export type TypedAsyncThunkAction<T> = PayloadAction<T, string, { arg: unknown; requestId: string; requestStatus: 'fulfilled' }, never>;

// Typed Reducers
export type TypedReducer<S, T> = (state: S, action: TypedPayloadAction<T>) => void;
export type TypedAsyncReducer<S, T> = (state: S, action: TypedAsyncThunkAction<T>) => void; 
