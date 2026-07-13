import { useState, useEffect } from 'react'
import { useSupabase } from '../contexts/SupabaseContext'

/**
 * Converts a URL-safe base64 string to a Uint8Array.
 * Required by PushManager.subscribe() for the applicationServerKey.
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Hook for managing browser push notification subscriptions.
 *
 * Returns:
 *   isSupported  – false if the browser doesn't support Push/Service Workers
 *   isSubscribed – true when this browser has an active push subscription
 *   isLoading    – true during async operations
 *   error        – string | null
 *   subscribe()  – requests permission and saves subscription to Supabase
 *   unsubscribe() – removes subscription from browser and Supabase
 */
export function usePushNotifications() {
    const supabase = useSupabase()
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const isSupported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window

    useEffect(() => {
        if (!isSupported) {
            setIsLoading(false)
            return
        }
        checkCurrentSubscription()
    }, [])

    async function checkCurrentSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function subscribe() {
        setIsLoading(true)
        setError(null)
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setError('Notification permission was denied. You can enable it in your browser settings.')
                return
            }

            const registration = await navigator.serviceWorker.ready
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                throw new Error('VITE_VAPID_PUBLIC_KEY is not configured.')
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            })

            const { endpoint, keys } = subscription.toJSON()

            // Get current user id
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated.')

            const { error: dbError } = await supabase
                .from('push_subscriptions')
                .upsert(
                    { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
                    { onConflict: 'endpoint' }
                )
            if (dbError) throw dbError

            setIsSubscribed(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function unsubscribe() {
        setIsLoading(true)
        setError(null)
        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            if (subscription) {
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint)
                await subscription.unsubscribe()
            }
            setIsSubscribed(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return { isSupported, isSubscribed, isLoading, error, subscribe, unsubscribe }
}
