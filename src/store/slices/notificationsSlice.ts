import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'
import { emailService, EmailPreferences } from '@/services/emailService'
import { pushNotificationService } from '@/services/pushNotificationService'

export interface Notification {
  id: string;
  type: 'prayer_turn' | 'prayer_request' | 'comment' | 'chain_invite' | 'prayer_answered';
  title: string;
  message: string;
  chainId?: string;
  requestId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  emailPreferences: EmailPreferences;
  emailVerified: boolean;
  pushEnabled: boolean;
  pushSupported: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  emailPreferences: {
    prayerTurnReminders: true,
    prayerRequestUpdates: true,
    dailyDigest: true,
    commentNotifications: true,
    chainInvites: true,
  },
  emailVerified: false,
  pushEnabled: false,
  pushSupported: 'Notification' in window && 'serviceWorker' in navigator,
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    const response = await api.get('/notifications')
    return response.data
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const response = await api.put('/notifications/mark-all-read')
    return response.data
  }
)

export const updateEmailPreferences = createAsyncThunk(
  'notifications/updateEmailPreferences',
  async (preferences: Partial<EmailPreferences>) => {
    const response = await emailService.updatePreferences(preferences)
    return response
  }
)

export const fetchEmailPreferences = createAsyncThunk(
  'notifications/fetchEmailPreferences',
  async () => {
    const response = await emailService.getPreferences()
    return response
  }
)

export const verifyEmail = createAsyncThunk(
  'notifications/verifyEmail',
  async (token: string) => {
    const response = await emailService.verifyEmail(token)
    return response
  }
)

export const resendVerificationEmail = createAsyncThunk(
  'notifications/resendVerification',
  async () => {
    const response = await emailService.resendVerificationEmail()
    return response
  }
)

export const enablePushNotifications = createAsyncThunk(
  'notifications/enablePush',
  async () => {
    const enabled = await pushNotificationService.enablePushNotifications()
    return enabled
  }
)

export const checkPushPermission = createAsyncThunk(
  'notifications/checkPushPermission',
  async () => {
    if (!('Notification' in window)) {
      return false
    }
    return Notification.permission === 'granted'
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setPushEnabled: (state, action) => {
      state.pushEnabled = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch notifications'
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(item => item.id === action.payload.id)
        if (notification && !notification.read) {
          notification.read = true
          state.unreadCount -= 1
        }
      })

      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(item => {
          item.read = true
        })
        state.unreadCount = 0
      })

      // Email preferences
      .addCase(updateEmailPreferences.fulfilled, (state, action) => {
        state.emailPreferences = {
          ...state.emailPreferences,
          ...action.payload,
        }
      })
      .addCase(fetchEmailPreferences.fulfilled, (state, action) => {
        state.emailPreferences = action.payload
      })

      // Email verification
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerified = true
      })

      // Push notifications
      .addCase(enablePushNotifications.fulfilled, (state, action) => {
        state.pushEnabled = action.payload
      })
      .addCase(checkPushPermission.fulfilled, (state, action) => {
        state.pushEnabled = action.payload
      })
  },
})

export const { clearError, setPushEnabled } = notificationsSlice.actions
export default notificationsSlice.reducer 
