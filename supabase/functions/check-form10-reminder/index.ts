import webpush from 'npm:web-push@3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
        const vapidEmail = Deno.env.get('VAPID_EMAIL')!

        webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

        const restHeaders = {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
        }

        // Current month as DATE string (first day), e.g. "2026-07-01"
        const now = new Date()
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

        // ── Deduplication check ──────────────────────────────────────────────
        // If we already sent a form10_reminder for this month in the past 12 hours,
        // skip this run (prevents duplicate sends if the function fires more than once).
        // We still allow a second send for the month (15th → 25th), so we only
        // block if sent_at is within the last 12 hours.
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        const recentLogRes = await fetch(
            `${supabaseUrl}/rest/v1/notification_log?notification_type=eq.form10_reminder&month_year=eq.${monthYear}&sent_at=gte.${twelveHoursAgo}&limit=1`,
            { headers: restHeaders }
        )
        const recentLog = await recentLogRes.json()
        if (Array.isArray(recentLog) && recentLog.length > 0) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'Already sent within the last 12 hours — skipping.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ── Find farms with Form 10 not yet completed this month ─────────────
        // Join: monthly_audits → farms (user_id) → barns (barn_name)
        const auditsRes = await fetch(
            `${supabaseUrl}/rest/v1/monthly_audits` +
            `?select=id,farm_id,farms!inner(user_id,farm_name,barns(id,barn_name))` +
            `&month_year=eq.${monthYear}` +
            `&form_10_completed=eq.false`,
            { headers: restHeaders }
        )
        const audits = await auditsRes.json()

        if (!Array.isArray(audits) || audits.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'All farms have completed Form 10 for this month.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ── Collect unique user IDs and fetch their push subscriptions ────────
        const userIds = [...new Set(audits.map((a: any) => a.farms?.user_id).filter(Boolean))]

        const subsRes = await fetch(
            `${supabaseUrl}/rest/v1/push_subscriptions?user_id=in.(${userIds.join(',')})`,
            { headers: restHeaders }
        )
        const subscriptions = await subsRes.json()

        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'No push subscriptions found for affected users.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Build userId → subscriptions[] map
        const subsByUser = subscriptions.reduce((acc: Record<string, any[]>, sub: any) => {
            if (!acc[sub.user_id]) acc[sub.user_id] = []
            acc[sub.user_id].push(sub)
            return acc
        }, {})

        const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })
        let sentCount = 0
        const logEntries: any[] = []
        const staleEndpoints: string[] = []

        for (const audit of audits) {
            const userId: string = audit.farms?.user_id
            const barns: any[] = audit.farms?.barns ?? []
            const userSubs: any[] = subsByUser[userId] ?? []

            if (!userId || userSubs.length === 0) continue

            for (const barn of barns) {
                const payload = JSON.stringify({
                    title: 'Pest Control Check Needed',
                    body: `${barn.barn_name}: Form 10 monthly pest control check is not yet complete for ${monthLabel}.`,
                    url: '/',
                    tag: `form10-${audit.farm_id}-${barn.id}-${monthYear}`,
                })

                for (const sub of userSubs) {
                    try {
                        await webpush.sendNotification(
                            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                            payload
                        )
                        sentCount++
                        if (!logEntries.find((e) => e.user_id === userId)) {
                            // One log entry per user per run (not per barn) to keep the
                            // deduplication check above accurate.
                            logEntries.push({
                                user_id: userId,
                                notification_type: 'form10_reminder',
                                month_year: monthYear,
                            })
                        }
                    } catch (err: any) {
                        // 410 Gone / 404 = subscription expired; clean it up
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            staleEndpoints.push(sub.endpoint)
                        }
                    }
                }
            }
        }

        // ── Persist log entries ───────────────────────────────────────────────
        if (logEntries.length > 0) {
            await fetch(`${supabaseUrl}/rest/v1/notification_log`, {
                method: 'POST',
                headers: { ...restHeaders, 'Prefer': 'return=minimal' },
                body: JSON.stringify(logEntries),
            })
        }

        // ── Remove stale subscriptions ────────────────────────────────────────
        for (const endpoint of staleEndpoints) {
            await fetch(
                `${supabaseUrl}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,
                { method: 'DELETE', headers: restHeaders }
            )
        }

        return new Response(
            JSON.stringify({ sent: sentCount, staleRemoved: staleEndpoints.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err: any) {
        console.error('check-form10-reminder error:', err)
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
