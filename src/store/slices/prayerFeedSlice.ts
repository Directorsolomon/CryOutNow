import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  createdAt: string;
  updatedAt: string;
  prayerCount: number;
  commentCount: number;
  hasPrayed: boolean;
  isAnswered: boolean;
  tags: string[];
}

interface PrayerFeedState {
  items: PrayerRequest[];
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  filters: {
    answered: boolean | null;
    sortBy: 'recent' | 'popular' | 'unanswered';
    tags: string[];
  };
}

const initialState: PrayerFeedState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,
  filters: {
    answered: null,
    sortBy: 'recent',
    tags: [],
  },
}

export const fetchPrayerRequests = createAsyncThunk(
  'prayerFeed/fetchRequests',
  async ({ page, filters }: { page: number; filters: PrayerFeedState['filters'] }) => {
    const response = await api.get('/prayer-requests', {
      params: {
        page,
        answered: filters.answered,
        sortBy: filters.sortBy,
        tags: filters.tags.join(','),
      },
    })
    return response.data
  }
)

export const createPrayerRequest = createAsyncThunk(
  'prayerFeed/createRequest',
  async (data: { title: string; description: string; tags: string[] }) => {
    const response = await api.post('/prayer-requests', data)
    return response.data
  }
)

export const prayForRequest = createAsyncThunk(
  'prayerFeed/pray',
  async (requestId: string) => {
    const response = await api.post(`/prayer-requests/${requestId}/pray`)
    return response.data
  }
)

export const addComment = createAsyncThunk(
  'prayerFeed/addComment',
  async ({ requestId, comment }: { requestId: string; comment: string }) => {
    const response = await api.post(`/prayer-requests/${requestId}/comments`, { comment })
    return response.data
  }
)

export const markAsAnswered = createAsyncThunk(
  'prayerFeed/markAnswered',
  async (requestId: string) => {
    const response = await api.post(`/prayer-requests/${requestId}/answered`)
    return response.data
  }
)

const prayerFeedSlice = createSlice({
  name: 'prayerFeed',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
      state.currentPage = 1 // Reset to first page when filters change
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
      state.currentPage = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrayerRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPrayerRequests.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchPrayerRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch prayer requests'
      })
      .addCase(createPrayerRequest.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(prayForRequest.fulfilled, (state, action) => {
        const request = state.items.find(item => item.id === action.payload.id)
        if (request) {
          request.prayerCount = action.payload.prayerCount
          request.hasPrayed = true
        }
      })
      .addCase(markAsAnswered.fulfilled, (state, action) => {
        const request = state.items.find(item => item.id === action.payload.id)
        if (request) {
          request.isAnswered = true
        }
      })
  },
})

export const { setFilters, resetFilters } = prayerFeedSlice.actions
export default prayerFeedSlice.reducer 