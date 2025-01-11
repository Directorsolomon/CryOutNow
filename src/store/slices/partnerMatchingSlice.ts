import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface MatchPreferences {
  prayerTopics: string[];
  availability: {
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    timeOfDay: ('morning' | 'afternoon' | 'evening')[];
  };
  preferredLanguages: string[];
  denominationPreference?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'experienced';
}

export interface PrayerPartner {
  id: string;
  displayName: string;
  photoURL?: string;
  matchScore: number;
  preferences: MatchPreferences;
  status: 'pending' | 'matched' | 'declined';
}

interface PartnerMatchingState {
  preferences: MatchPreferences | null;
  suggestedPartners: PrayerPartner[];
  currentPartner: PrayerPartner | null;
  loading: boolean;
  error: string | null;
}

const initialState: PartnerMatchingState = {
  preferences: null,
  suggestedPartners: [],
  currentPartner: null,
  loading: false,
  error: null,
}

export const updatePreferences = createAsyncThunk(
  'partnerMatching/updatePreferences',
  async (preferences: MatchPreferences) => {
    const response = await api.put('/prayer-partners/preferences', preferences)
    return response.data
  }
)

export const fetchSuggestedPartners = createAsyncThunk(
  'partnerMatching/fetchSuggested',
  async () => {
    const response = await api.get('/prayer-partners/suggestions')
    return response.data
  }
)

export const requestPartner = createAsyncThunk(
  'partnerMatching/request',
  async (partnerId: string) => {
    const response = await api.post(`/prayer-partners/request/${partnerId}`)
    return response.data
  }
)

export const respondToRequest = createAsyncThunk(
  'partnerMatching/respond',
  async ({ partnerId, accept }: { partnerId: string; accept: boolean }) => {
    const response = await api.post(`/prayer-partners/respond/${partnerId}`, { accept })
    return response.data
  }
)

export const endPartnership = createAsyncThunk(
  'partnerMatching/end',
  async (partnerId: string) => {
    const response = await api.post(`/prayer-partners/end/${partnerId}`)
    return response.data
  }
)

const partnerMatchingSlice = createSlice({
  name: 'partnerMatching',
  initialState,
  reducers: {
    clearSuggestedPartners: (state) => {
      state.suggestedPartners = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Update preferences
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false
        state.preferences = action.payload
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update preferences'
      })

      // Fetch suggested partners
      .addCase(fetchSuggestedPartners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuggestedPartners.fulfilled, (state, action) => {
        state.loading = false
        state.suggestedPartners = action.payload
      })
      .addCase(fetchSuggestedPartners.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch suggested partners'
      })

      // Request partner
      .addCase(requestPartner.fulfilled, (state, action) => {
        const partner = state.suggestedPartners.find(p => p.id === action.payload.partnerId)
        if (partner) {
          partner.status = 'pending'
        }
      })

      // Respond to request
      .addCase(respondToRequest.fulfilled, (state, action) => {
        if (action.payload.accepted) {
          state.currentPartner = action.payload.partner
        }
      })

      // End partnership
      .addCase(endPartnership.fulfilled, (state) => {
        state.currentPartner = null
      })
  },
})

export const { clearSuggestedPartners } = partnerMatchingSlice.actions
export default partnerMatchingSlice.reducer 