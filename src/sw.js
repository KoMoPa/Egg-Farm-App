import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'

// Take control of all clients immediately on activation
self.skipWaiting()
clientsClaim()

// Clean up old caches from previous SW versions, then precache the new manifest
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Push Notification Handler ──────────────────────────────────────────────

self.addEventListener('push', (event) => {
    const payload = event.data?.json() ?? {
        title: 'SCSC Compliance Tracker',
        body: 'You have a compliance reminder.',
        url: '/',
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            data: { url: payload.url ?? '/' },
            tag: payload.tag ?? 'scsc-reminder',
            renotify: true,
        })
    )
})

// ── Notification Click Handler ─────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const targetUrl = event.notification.data?.url ?? '/'

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // If the app is already open, focus it
                for (const client of windowClients) {
                    if ('focus' in client) {
                        return client.focus()
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl)
                }
            })
    )
})
