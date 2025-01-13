import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  bio?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials)
    const { user, token } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('userId', user.id)
    return { user, token }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { displayName: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData)
    const { user, token } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('userId', user.id)
    return { user, token }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: {
    displayName: string
    email: string
    bio?: string
    photoURL?: string
  }) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Registration failed'
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update profile'
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
      })
  },
})

export default authSlice.reducer 
