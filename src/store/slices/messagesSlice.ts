import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhotoURL?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface MessagesState {
  conversations: Conversation[];
  currentConversation: {
    messages: Message[];
    loading: boolean;
    hasMore: boolean;
  };
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  currentConversation: {
    messages: [],
    loading: false,
    hasMore: true,
  },
  loading: false,
  error: null,
}

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async () => {
    const response = await api.get('/messages/conversations')
    return response.data
  }
)

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ userId, lastMessageId }: { userId: string; lastMessageId?: string }) => {
    const response = await api.get(`/messages/${userId}`, {
      params: { lastMessageId },
    })
    return response.data
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ userId, content }: { userId: string; content: string }) => {
    const response = await api.post(`/messages/${userId}`, { content })
    return response.data
  }
)

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (userId: string) => {
    const response = await api.put(`/messages/${userId}/read`)
    return { userId, messages: response.data }
  }
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation.messages = []
      state.currentConversation.hasMore = true
    },
    addMessage: (state, action) => {
      const message = action.payload
      state.currentConversation.messages.push(message)
      
      // Update conversation list
      const conversationIndex = state.conversations.findIndex(
        c => c.participantId === message.senderId || c.participantId === message.receiverId
      )
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message
        state.conversations[conversationIndex].updatedAt = message.createdAt
        if (message.senderId !== message.receiverId) {
          state.conversations[conversationIndex].unreadCount++
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false
        state.conversations = action.payload
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch conversations'
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.currentConversation.loading = true
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.currentConversation.loading = false
        if (action.meta.arg.lastMessageId) {
          state.currentConversation.messages.unshift(...action.payload)
        } else {
          state.currentConversation.messages = action.payload
        }
        state.currentConversation.hasMore = action.payload.length === 20 // Assuming page size of 20
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.currentConversation.messages.push(action.payload)
        const { senderId, receiverId } = action.payload
        
        // Update conversation list
        const conversationIndex = state.conversations.findIndex(
          c => c.participantId === senderId || c.participantId === receiverId
        )
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = action.payload
          state.conversations[conversationIndex].updatedAt = action.payload.createdAt
        }
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversationIndex = state.conversations.findIndex(
          c => c.participantId === action.meta.arg
        )
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0
        }
        state.currentConversation.messages = state.currentConversation.messages.map(
          message => message.senderId === action.meta.arg ? { ...message, read: true } : message
        )
      })
  },
})

export const { clearCurrentConversation, addMessage } = messagesSlice.actions
export default messagesSlice.reducer 