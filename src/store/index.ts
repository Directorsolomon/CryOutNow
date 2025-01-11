import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import prayerChainsReducer from './slices/prayerChainsSlice'
import notificationsReducer from './slices/notificationsSlice'
import prayerFeedReducer from './slices/prayerFeedSlice'
import friendsReducer from './slices/friendsSlice'
import messagesReducer from './slices/messagesSlice'
import groupSessionsReducer from './slices/groupSessionsSlice'
import partnerMatchingReducer from './slices/partnerMatchingSlice'
import moderationReducer from './slices/moderationSlice'
import analyticsReducer from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    prayerChains: prayerChainsReducer,
    notifications: notificationsReducer,
    prayerFeed: prayerFeedReducer,
    friends: friendsReducer,
    messages: messagesReducer,
    groupSessions: groupSessionsReducer,
    partnerMatching: partnerMatchingReducer,
    moderation: moderationReducer,
    analytics: analyticsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 