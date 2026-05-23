/**
 * helpers.js
 *
 * Shared utilities for Playwright E2E tests.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Supabase client for DB queries (uses anon key + user JWT via RLS) ────────
// IMPORTANT: We use the publishable (anon) key here, NOT the service-role key.
// The sb_secret_* service-role key bypasses RLS in PostgREST, causing queries
// without farm_id filters (e.g. monthly_audits LIKE 'YYYY-MM%') to see rows
// from ALL users — maybeSingle() then silently returns null on multiple rows.
// With the anon key + user JWT in Authorization, RLS restricts results to the
// test user's farm so maybeSingle() reliably returns the expected single row.
export function createAdminClient() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')

  // Extract user's access_token from the saved Playwright auth state so that
  // PostgREST requests are made as the authenticated test user (RLS allows it).
  let accessToken = null
  try {
    const authState = JSON.parse(
      fs.readFileSync(path.join(__dirname, '.auth-state.json'), 'utf8')
    )
    for (const origin of authState.origins ?? []) {
      for (const entry of origin.localStorage ?? []) {
        if (entry.name?.includes('-auth-token')) {
          const session = JSON.parse(entry.value)
          if (session?.access_token) { accessToken = session.access_token; break }
        }
      }
      if (accessToken) break
    }
  } catch { /* auth-state.json not yet written (during global-setup) */ }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    ...(accessToken && { global: { headers: { Authorization: `Bearer ${accessToken}` } } }),
  })
}


// ── Get test user's farm from saved global-setup data ───────────────────────
export async function getTestFarm(_adminClient) {
  // Read farm data written by global-setup (avoids needing service_role PostgREST access)
  const dataPath = path.join(__dirname, '.test-farm-data.json')
  if (fs.existsSync(dataPath)) {
    const { farmId, farmName } = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    const { userId, email } = JSON.parse(
      fs.readFileSync(path.join(__dirname, '.test-user-id.json'), 'utf8')
    )
    return { user: { id: userId, email }, farm: { id: farmId, farm_name: farmName } }
  }
  // Fallback: query via admin client (requires PostgREST access)
  const adminClient = _adminClient ?? createAdminClient()
  const email = process.env.TEST_USER_EMAIL
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const user = users.find(u => u.email === email)
  if (!user) throw new Error(`Test user not found: ${email}`)
  const { data: farm, error } = await adminClient
    .from('farms').select('*').eq('user_id', user.id).maybeSingle()
  if (error) throw error
  return { user, farm }
}

// ── Get test barn from saved global-setup data ──────────────────────────────
export async function getTestBarn(_adminClient, _farmId) {
  const adminClient = _adminClient ?? createAdminClient()
  const dataPath = path.join(__dirname, '.test-farm-data.json')
  if (fs.existsSync(dataPath)) {
    // Always do a live Supabase query so callers get current column values
    // (e.g. flock_arrival_date) rather than the minimal cached JSON object.
    const { barnId } = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    const { data: barn, error } = await adminClient
      .from('barns').select('*').eq('id', barnId).maybeSingle()
    if (error) throw error
    return barn
  }
  // Fallback: query via admin client
  const barnName = process.env.TEST_BARN_NAME || 'E2E Test Barn'
  const { data: barn, error } = await adminClient
    .from('barns').select('*').eq('farm_id', _farmId).eq('barn_name', barnName).maybeSingle()
  if (error) throw error
  return barn
}

// ── Navigate to a tab in the app ────────────────────────────────────────────
export async function navigateToTab(page, tabKey) {
  // Bottom nav buttons contain the emoji + label
  const labelMap = {
    home: 'Dashboard',
    form07: 'Production',
    form08: 'Welfare',
    form09: 'Feed/Water',
    form10: 'Pest Control',
  }
  const label = labelMap[tabKey]
  if (!label) throw new Error(`Unknown tab: ${tabKey}`)
  await page.click(`nav button:has-text("${label}")`)
  // Wait for the tab content to render
  await page.waitForTimeout(400)
}

// ── Select a day in the react-calendar DaySelector ──────────────────────────
// Clicks the tile for the given day number in the calendar.
export async function selectCalendarDay(page, day) {
  // react-calendar renders <abbr aria-label="May 1, 2026"> etc.
  // We click the parent button by locating it via the abbr text content.
  const tile = page.locator('.day-selector-calendar button.react-calendar__tile').filter({
    has: page.locator(`abbr:text-is("${day}")`)
  })
  await tile.first().click()
  // Small wait for day data to load
  await page.waitForTimeout(500)
}

// ── Dismiss any browser alert/dialog ────────────────────────────────────────
export function autoAcceptDialogs(page) {
  page.on('dialog', dialog => dialog.accept())
}

// ── Helper: wait for the "Already recorded" locked banner ───────────────────
export async function waitForLockedBanner(page, day) {
  await page.waitForSelector(
    `text=Already recorded for Day ${day}`,
    { timeout: 10_000 }
  )
}

// ── Current month as YYYY-MM-01 ─────────────────────────────────────────────
export function currentMonthYear() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

// ── Build a record_date string for a given day in the current month ──────────
export function recordDate(day) {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}
