import { getAnalytics, logEvent, setCurrentScreen } from 'firebase/analytics';
import { app } from '../lib/firebase';

const analytics = getAnalytics(app);

export function trackPageView(path: string) {
  try {
    setCurrentScreen(analytics, path);
    logEvent(analytics, 'page_view', {
      page_path: path,
      page_title: document.title,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    logEvent(analytics, eventName, params);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function logError(error: Error, errorInfo?: React.ErrorInfo) {
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
} 