import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { messagesSlice } from './slices/messagesSlice';
import { prayerFeedSlice } from './slices/prayerFeedSlice';
import { analyticsSlice } from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    messages: messagesSlice.reducer,
    prayerFeed: prayerFeedSlice.reducer,
    analytics: analyticsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.timestamp', 'meta.arg', 'payload.user'],
        ignoredPaths: ['auth.user', 'messages.currentConversation'],
      },
    }),
});

export type AppStore = typeof store; 
