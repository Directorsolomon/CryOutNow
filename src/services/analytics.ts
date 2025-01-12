import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from '@/lib/firebase';

const analytics = getAnalytics(app);

export const logError = (error: Error, errorInfo?: React.ErrorInfo) => {
  try {
    logEvent(analytics, 'error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo?.componentStack,
    });
  } catch (analyticsError) {
    console.error('Failed to log error:', analyticsError);
  }
};

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