import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetType: 'user' | 'prayer-request' | 'comment' | 'prayer-chain' | 'message';
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGuideline {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'prayer' | 'communication' | 'respect' | 'privacy';
  order: number;
}

interface ModerationState {
  reports: Report[];
  guidelines: CommunityGuideline[];
  loading: boolean;
  error: string | null;
}

const initialState: ModerationState = {
  reports: [],
  guidelines: [],
  loading: false,
  error: null,
}

export const fetchReports = createAsyncThunk(
  'moderation/fetchReports',
  async () => {
    const response = await api.get('/moderation/reports')
    return response.data
  }
)

export const submitReport = createAsyncThunk(
  'moderation/submitReport',
  async (report: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/moderation/reports', report)
    return response.data
  }
)

export const updateReportStatus = createAsyncThunk(
  'moderation/updateReportStatus',
  async ({ reportId, status }: { reportId: string; status: Report['status'] }) => {
    const response = await api.put(`/moderation/reports/${reportId}`, { status })
    return response.data
  }
)

export const fetchGuidelines = createAsyncThunk(
  'moderation/fetchGuidelines',
  async () => {
    const response = await api.get('/moderation/guidelines')
    return response.data
  }
)

export const updateGuideline = createAsyncThunk(
  'moderation/updateGuideline',
  async (guideline: CommunityGuideline) => {
    const response = await api.put(`/moderation/guidelines/${guideline.id}`, guideline)
    return response.data
  }
)

const moderationSlice = createSlice({
  name: 'moderation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch reports'
      })

      // Submit report
      .addCase(submitReport.fulfilled, (state, action) => {
        state.reports.push(action.payload)
      })

      // Update report status
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        const index = state.reports.findIndex(r => r.id === action.payload.id)
        if (index !== -1) {
          state.reports[index] = action.payload
        }
      })

      // Fetch guidelines
      .addCase(fetchGuidelines.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGuidelines.fulfilled, (state, action) => {
        state.loading = false
        state.guidelines = action.payload
      })
      .addCase(fetchGuidelines.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch guidelines'
      })

      // Update guideline
      .addCase(updateGuideline.fulfilled, (state, action) => {
        const index = state.guidelines.findIndex(g => g.id === action.payload.id)
        if (index !== -1) {
          state.guidelines[index] = action.payload
        }
      })
  },
})

export default moderationSlice.reducer 