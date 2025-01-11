import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import api from './api'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

class PushNotificationService {
  private vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        })
        return registration
      }
      return null
    } catch (error) {
      console.error('Failed to register service worker:', error)
      return null
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const currentToken = await getToken(messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: await this.registerServiceWorker(),
      })

      if (currentToken) {
        await this.sendTokenToServer(currentToken)
        return currentToken
      }

      console.log('No registration token available. Request permission to generate one.')
      return null
    } catch (error) {
      console.error('An error occurred while retrieving token:', error)
      return null
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      await api.post('/notifications/push-token', { token })
    } catch (error) {
      console.error('Failed to send push token to server:', error)
    }
  }

  setupMessageListener(callback: (payload: any) => void): void {
    onMessage(messaging, (payload) => {
      // Create a notification if the app is in the foreground
      if (Notification.permission === 'granted') {
        const { title, body, icon } = payload.notification || {}
        const notificationOptions = {
          body,
          icon: icon || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: payload.data,
        }

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title || 'New Notification', notificationOptions)
          })
        }
      }

      // Call the callback with the payload
      callback(payload)
    })
  }

  async enablePushNotifications(): Promise<boolean> {
    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      return false
    }

    const token = await this.getToken()
    return token !== null
  }
}

export const pushNotificationService = new PushNotificationService()
export default pushNotificationService 