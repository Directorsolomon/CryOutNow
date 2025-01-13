import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface Friend {
  id: string;
  displayName: string;
  photoURL?: string;
  email: string;
  status: 'online' | 'offline';
  lastActive: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface FriendsState {
  friends: Friend[];
  sentRequests: FriendRequest[];
  receivedRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  loading: false,
  error: null,
}

export const fetchFriends = createAsyncThunk(
  'friends/fetchAll',
  async () => {
    const response = await api.get('/friends')
    return response.data
  }
)

export const fetchFriendRequests = createAsyncThunk(
  'friends/fetchRequests',
  async () => {
    const response = await api.get('/friends/requests')
    return response.data
  }
)

export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async (userId: string) => {
    const response = await api.post(`/friends/requests/${userId}`)
    return response.data
  }
)

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async (requestId: string) => {
    const response = await api.put(`/friends/requests/${requestId}/accept`)
    return response.data
  }
)

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectRequest',
  async (requestId: string) => {
    const response = await api.put(`/friends/requests/${requestId}/reject`)
    return response.data
  }
)

export const removeFriend = createAsyncThunk(
  'friends/remove',
  async (friendId: string) => {
    await api.delete(`/friends/${friendId}`)
    return friendId
  }
)

export const searchUsers = createAsyncThunk(
  'friends/searchUsers',
  async (query: string) => {
    const response = await api.get('/users/search', {
      params: { query },
    })
    return response.data
  }
)

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateFriendStatus: (state, action) => {
      const { userId, status, lastActive } = action.payload
      const friend = state.friends.find(f => f.id === userId)
      if (friend) {
        friend.status = status
        friend.lastActive = lastActive
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false
        state.friends = action.payload
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch friends'
      })

      // Fetch friend requests
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload.sent
        state.receivedRequests = action.payload.received
      })

      // Send friend request
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.push(action.payload)
      })

      // Accept friend request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const { request, friend } = action.payload
        state.friends.push(friend)
        state.receivedRequests = state.receivedRequests.filter(
          req => req.id !== request.id
        )
      })

      // Reject friend request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(
          req => req.id !== action.payload.id
        )
      })

      // Remove friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          friend => friend.id !== action.payload
        )
      })
  },
})

export const { clearError, updateFriendStatus } = friendsSlice.actions
export default friendsSlice.reducer 
