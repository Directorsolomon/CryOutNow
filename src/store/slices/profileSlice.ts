import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

interface ProfileState {
  loading: boolean
  error: string | null
  stats: {
    totalPrayers: number
    prayerChains: number
    prayerRequests: number
  }
}

const initialState: ProfileState = {
  loading: false,
  error: null,
  stats: {
    totalPrayers: 0,
    prayerChains: 0,
    prayerRequests: 0,
  },
}

export interface UpdateProfileData {
  displayName: string
  email: string
  avatar?: string
  bio?: string
  preferences: {
    emailNotifications: boolean
    prayerReminders: boolean
    chainTurnNotifications: boolean
    dailyDigest: boolean
  }
}

export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data: UpdateProfileData) => {
    const response = await api.patch('/api/users/me', data)
    return response.data
  }
)

export const fetchProfileStats = createAsyncThunk(
  'profile/fetchStats',
  async () => {
    const response = await api.get('/api/users/me/stats')
    return response.data
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update profile'
      })
      // Fetch Stats
      .addCase(fetchProfileStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchProfileStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch profile stats'
      })
  },
})

export default profileSlice.reducer 
