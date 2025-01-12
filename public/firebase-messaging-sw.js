importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "cryoutnow-6ce3d.firebaseapp.com",
  projectId: "cryoutnow-6ce3d",
  storageBucket: "cryoutnow-6ce3d.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const { title, body, icon } = payload.notification || {}
  const notificationOptions = {
    body,
    icon: icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
    tag: payload.data?.type || 'default', // Group notifications by type
    renotify: true, // Notify even if there's an existing notification with the same tag
  }

  self.registration.showNotification(title || 'New Notification', notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  ).href

  const promiseChain = clients
    .matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        // If so, focus it
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })

  event.waitUntil(promiseChain)
})