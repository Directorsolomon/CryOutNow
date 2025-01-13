import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostPhotoURL?: string;
  startTime: string;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  prayerTopics: string[];
  isPrivate: boolean;
}

export interface Participant {
  id: string;
  displayName: string;
  photoURL?: string;
  joinedAt: string;
  role: 'host' | 'participant';
  status: 'active' | 'inactive';
}

interface GroupSessionsState {
  sessions: GroupSession[];
  currentSession: {
    details: GroupSession | null;
    participants: Participant[];
    loading: boolean;
    error: string | null;
  };
  loading: boolean;
  error: string | null;
}

const initialState: GroupSessionsState = {
  sessions: [],
  currentSession: {
    details: null,
    participants: [],
    loading: false,
    error: null,
  },
  loading: false,
  error: null,
}

export const fetchGroupSessions = createAsyncThunk(
  'groupSessions/fetchAll',
  async () => {
    const response = await api.get('/group-sessions')
    return response.data
  }
)

export const createGroupSession = createAsyncThunk(
  'groupSessions/create',
  async (data: {
    title: string;
    description: string;
    startTime: string;
    duration: number;
    maxParticipants: number;
    prayerTopics: string[];
    isPrivate: boolean;
  }) => {
    const response = await api.post('/group-sessions', data)
    return response.data
  }
)

export const joinGroupSession = createAsyncThunk(
  'groupSessions/join',
  async (sessionId: string) => {
    const response = await api.post(`/group-sessions/${sessionId}/join`)
    return response.data
  }
)

export const leaveGroupSession = createAsyncThunk(
  'groupSessions/leave',
  async (sessionId: string) => {
    const response = await api.post(`/group-sessions/${sessionId}/leave`)
    return response.data
  }
)

export const fetchSessionDetails = createAsyncThunk(
  'groupSessions/fetchDetails',
  async (sessionId: string) => {
    const [detailsResponse, participantsResponse] = await Promise.all([
      api.get(`/group-sessions/${sessionId}`),
      api.get(`/group-sessions/${sessionId}/participants`),
    ])
    return {
      details: detailsResponse.data,
      participants: participantsResponse.data,
    }
  }
)

export const updateSessionStatus = createAsyncThunk(
  'groupSessions/updateStatus',
  async ({ sessionId, status }: { sessionId: string; status: GroupSession['status'] }) => {
    const response = await api.put(`/group-sessions/${sessionId}/status`, { status })
    return response.data
  }
)

const groupSessionsSlice = createSlice({
  name: 'groupSessions',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession.details = null
      state.currentSession.participants = []
      state.currentSession.error = null
    },
    updateParticipantStatus: (state, action) => {
      const { participantId, status } = action.payload
      const participant = state.currentSession.participants.find(p => p.id === participantId)
      if (participant) {
        participant.status = status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sessions
      .addCase(fetchGroupSessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupSessions.fulfilled, (state, action) => {
        state.loading = false
        state.sessions = action.payload
      })
      .addCase(fetchGroupSessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch group sessions'
      })

      // Create session
      .addCase(createGroupSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload)
      })

      // Join session
      .addCase(joinGroupSession.fulfilled, (state, action) => {
        const session = state.sessions.find(s => s.id === action.payload.sessionId)
        if (session) {
          session.currentParticipants++
        }
        if (state.currentSession.details?.id === action.payload.sessionId) {
          state.currentSession.participants.push(action.payload.participant)
        }
      })

      // Leave session
      .addCase(leaveGroupSession.fulfilled, (state, action) => {
        const session = state.sessions.find(s => s.id === action.payload.sessionId)
        if (session) {
          session.currentParticipants--
        }
        if (state.currentSession.details?.id === action.payload.sessionId) {
          state.currentSession.participants = state.currentSession.participants.filter(
            p => p.id !== action.payload.participantId
          )
        }
      })

      // Fetch session details
      .addCase(fetchSessionDetails.pending, (state) => {
        state.currentSession.loading = true
        state.currentSession.error = null
      })
      .addCase(fetchSessionDetails.fulfilled, (state, action) => {
        state.currentSession.loading = false
        state.currentSession.details = action.payload.details
        state.currentSession.participants = action.payload.participants
      })
      .addCase(fetchSessionDetails.rejected, (state, action) => {
        state.currentSession.loading = false
        state.currentSession.error = action.error.message || 'Failed to fetch session details'
      })

      // Update session status
      .addCase(updateSessionStatus.fulfilled, (state, action) => {
        const session = state.sessions.find(s => s.id === action.payload.id)
        if (session) {
          session.status = action.payload.status
        }
        if (state.currentSession.details?.id === action.payload.id) {
          state.currentSession.details.status = action.payload.status
        }
      })
  },
})

export const { clearCurrentSession, updateParticipantStatus } = groupSessionsSlice.actions
export default groupSessionsSlice.reducer 
