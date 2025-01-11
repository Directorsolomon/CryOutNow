import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface Participant {
  id: string;
  name: string;
}

export interface PrayerChain {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  participants: Participant[];
  maxParticipants: number;
  turnDurationDays: number;
  currentTurn: Participant | null;
}

export interface PrayerChainsState {
  chains: PrayerChain[];
  userChains: string[];
  loading: boolean;
  error: string | null;
}

const initialState: PrayerChainsState = {
  chains: [],
  userChains: [],
  loading: false,
  error: null,
}

export const fetchPrayerChains = createAsyncThunk(
  'prayerChains/fetchAll',
  async () => {
    const response = await api.get('/prayer-chains')
    return response.data
  }
)

export const createPrayerChain = createAsyncThunk(
  'prayerChains/create',
  async (data: {
    title: string;
    description: string;
    maxParticipants: number;
    turnDurationDays: number;
  }) => {
    const response = await api.post('/prayer-chains', data)
    return response.data
  }
)

export const fetchUserChains = createAsyncThunk(
  'prayerChains/fetchUserChains',
  async () => {
    const response = await api.get('/prayer-chains/user')
    return response.data
  }
)

const prayerChainsSlice = createSlice({
  name: 'prayerChains',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrayerChains.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPrayerChains.fulfilled, (state, action) => {
        state.loading = false
        state.chains = action.payload
      })
      .addCase(fetchPrayerChains.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch prayer chains'
      })
      .addCase(createPrayerChain.fulfilled, (state, action) => {
        state.chains.push(action.payload)
      })
      .addCase(fetchUserChains.fulfilled, (state, action) => {
        state.userChains = action.payload
      })
  },
})

export default prayerChainsSlice.reducer 