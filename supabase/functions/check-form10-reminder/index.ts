import webpush from 'npm:web-push@3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FORMS = [
    {
        field: 'form_07_completed',
        type: 'form07_reminder',
        title: 'Production Records Due',
        body: (barn: string, month: string) =>
            `${barn}: Form 07 Production & Cooler Records are not yet complete for ${month}.`,
    },
    {
        field: 'form_08_completed',
        type: 'form08_reminder',
        title: 'Welfare Records Due',
        body: (barn: string, month: string) =>
            `${barn}: Form 08 Welfare Records are not yet complete for ${month}.`,
    },
    {
        field: 'form_09_completed',
        type: 'form09_reminder',
        title: 'Feed & Water Records Due',
        body: (barn: string, month: string) =>
            `${barn}: Form 09 Feed & Water Records are not yet complete for ${month}.`,
    },
    {
        field: 'form_10_completed',
        type: 'form10_reminder',
        title: 'Pest Control Check Needed',
        body: (barn: string, month: string) =>
            `${barn}: Form 10 monthly pest control check is not yet complete for ${month}.`,
    },
]

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

        const now = new Date()
        const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

        // ── Fetch recent log entries for all form types in one query ──────────
        const allTypes = FORMS.map((f) => f.type).join(',')
        const recentLogRes = await fetch(
            `${supabaseUrl}/rest/v1/notification_log` +
            `?notification_type=in.(${allTypes})` +
            `&month_year=eq.${monthYear}` +
            `&sent_at=gte.${twelveHoursAgo}` +
            `&select=notification_type`,
            { headers: restHeaders }
        )
        const recentLog: any[] = await recentLogRes.json()
        // Types already sent in the last 12 hours — skip these to prevent duplicates
        const recentlySentTypes = new Set(recentLog.map((e: any) => e.notification_type))

        // ── Fetch audits with any incomplete form this month ─────────────────
        const auditsRes = await fetch(
            `${supabaseUrl}/rest/v1/monthly_audits` +
            `?select=farm_id,form_07_completed,form_08_completed,form_09_completed,form_10_completed,farms!inner(user_id,barns(id,barn_name))` +
            `&month_year=eq.${monthYear}` +
            `&or=(form_07_completed.eq.false,form_08_completed.eq.false,form_09_completed.eq.false,form_10_completed.eq.false)`,
            { headers: restHeaders }
        )
        const audits: any[] = await auditsRes.json()

        if (!Array.isArray(audits) || audits.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'All farms have completed all forms for this month.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // ── Fetch push subscriptions for affected users ───────────────────────
        const userIds = [...new Set(audits.map((a: any) => a.farms?.user_id).filter(Boolean))]

        const subsRes = await fetch(
            `${supabaseUrl}/rest/v1/push_subscriptions?user_id=in.(${userIds.join(',')})`,
            { headers: restHeaders }
        )
        const subscriptions: any[] = await subsRes.json()

        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, message: 'No push subscriptions found for affected users.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const subsByUser = subscriptions.reduce((acc: Record<string, any[]>, sub: any) => {
            if (!acc[sub.user_id]) acc[sub.user_id] = []
            acc[sub.user_id].push(sub)
            return acc
        }, {})

        let sentCount = 0
        const logEntries: any[] = []
        const staleEndpoints: string[] = []

        for (const form of FORMS) {
            if (recentlySentTypes.has(form.type)) continue

            const incompleteAudits = audits.filter((a: any) => a[form.field] === false)
            if (incompleteAudits.length === 0) continue

            for (const audit of incompleteAudits) {
                const userId: string = audit.farms?.user_id
                const barns: any[] = audit.farms?.barns ?? []
                const userSubs: any[] = subsByUser[userId] ?? []
                if (!userId || userSubs.length === 0) continue

                for (const barn of barns) {
                    const payload = JSON.stringify({
                        title: form.title,
                        body: form.body(barn.barn_name, monthLabel),
                        url: '/',
                        tag: `${form.type}-${audit.farm_id}-${barn.id}-${monthYear}`,
                    })

                    for (const sub of userSubs) {
                        try {
                            await webpush.sendNotification(
                                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                                payload
                            )
                            sentCount++
                        } catch (err: any) {
                            if (err.statusCode === 410 || err.statusCode === 404) {
                                staleEndpoints.push(sub.endpoint)
                            }
                        }
                    }
                }

                // One log entry per user per form type per run
                if (!logEntries.find((e) => e.user_id === userId && e.notification_type === form.type)) {
                    logEntries.push({ user_id: userId, notification_type: form.type, month_year: monthYear })
                }
            }
        }

        if (logEntries.length > 0) {
            await fetch(`${supabaseUrl}/rest/v1/notification_log`, {
                method: 'POST',
                headers: { ...restHeaders, 'Prefer': 'return=minimal' },
                body: JSON.stringify(logEntries),
            })
        }

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
        console.error('check-form-reminders error:', err)
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

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
