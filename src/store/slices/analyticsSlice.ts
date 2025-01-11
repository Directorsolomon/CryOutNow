import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface UserMetrics {
  activeUsers: number;
  averageSessionDuration: number;
  newUserSignups: number;
  totalUsers: number;
  userRetentionRate: number;
}

export interface PrayerChainMetrics {
  totalChains: number;
  activeChains: number;
  completionRate: number;
  averageDuration: number;
  participantsPerChain: number;
}

export interface PrayerRequestMetrics {
  totalRequests: number;
  averagePrayersPerRequest: number;
  responseRate: number;
  topPrayerTopics: Array<{ topic: string; count: number }>;
}

export interface CommunityMetrics {
  totalConnections: number;
  messagesSent: number;
  groupSessionsHosted: number;
  averageGroupSize: number;
  partnerMatchRate: number;
}

interface AnalyticsState {
  userMetrics: UserMetrics | null;
  prayerChainMetrics: PrayerChainMetrics | null;
  prayerRequestMetrics: PrayerRequestMetrics | null;
  communityMetrics: CommunityMetrics | null;
  timeRange: 'day' | 'week' | 'month' | 'year';
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  userMetrics: null,
  prayerChainMetrics: null,
  prayerRequestMetrics: null,
  communityMetrics: null,
  timeRange: 'week',
  loading: false,
  error: null,
}

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (timeRange: AnalyticsState['timeRange']) => {
    const response = await api.get(`/analytics?timeRange=${timeRange}`)
    return response.data
  }
)

export const trackEvent = createAsyncThunk(
  'analytics/trackEvent',
  async (event: { 
    category: string;
    action: string;
    label?: string;
    value?: number;
  }) => {
    await api.post('/analytics/events', event)
    return event
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.userMetrics = action.payload.userMetrics
        state.prayerChainMetrics = action.payload.prayerChainMetrics
        state.prayerRequestMetrics = action.payload.prayerRequestMetrics
        state.communityMetrics = action.payload.communityMetrics
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch analytics'
      })
  },
})

export const { setTimeRange } = analyticsSlice.actions
export default analyticsSlice.reducer 