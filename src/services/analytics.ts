import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from '@/lib/firebase';

const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, params?: object) => {
  try {
    logEvent(analytics, eventName, params);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackPageView = (pageName: string) => {
  trackEvent('page_view', { page_name: pageName });
};

export const trackPrayerAction = (action: 'create' | 'pray' | 'share', requestId: string) => {
  trackEvent('prayer_action', { action, request_id: requestId });
};