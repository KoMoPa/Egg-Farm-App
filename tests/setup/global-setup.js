/**
 * global-setup.js
 *
 * Runs once before all Playwright tests.
 * 1. Creates (or resets) a dedicated E2E test user via Supabase Admin API.
 * 2. Signs that user in via the Supabase JS client (Node.js, no UI) to get a
 *    session, then injects it into browser localStorage so tests start
 *    already authenticated (auth tests opt-out via clearCookies).
 */

import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json')

export default async function globalSetup() {
  const {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_PUBLISHABLE_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    TEST_USER_EMAIL: email,
    TEST_USER_PASSWORD: password,
  } = process.env

  if (!url || !anonKey || !serviceKey || !email || !password) {
    throw new Error(
      'Missing required env vars. Copy .env.test.example → .env.test and fill in values.'
    )
  }

  // ── 1. Create test user (idempotent) ─────────────────────────────────────
  const adminSupabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Try to find existing test user
  const { data: { users }, error: listErr } = await adminSupabase.auth.admin.listUsers()
  if (listErr) throw listErr

  const existing = users.find(u => u.email === email)
  let userId

  if (existing) {
    userId = existing.id
    // Reset the password so tests always use the right credentials
    await adminSupabase.auth.admin.updateUserById(userId, { password })
    console.log(`[global-setup] Using existing test user ${email} (${userId})`)
  } else {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // bypass email confirmation
    })
    if (error) throw error
    userId = data.user.id
    console.log(`[global-setup] Created test user ${email} (${userId})`)
  }

  // Store userId so global-teardown can find it without listing all users again
  fs.writeFileSync(
    path.join(__dirname, '.test-user-id.json'),
    JSON.stringify({ userId, email })
  )

  // ── 2. Sign in via raw REST API with anon key ────────────────────────────
  // The legacy anon key (HS256 JWT) works from Node.js without a CORS Origin
  // header and generates HS256-signed user JWTs that PostgREST can verify.
  // The sb_secret_* service key generates ES256 JWTs, which causes 401 in
  // PostgREST when paired with the origin-restricted sb_publishable_* key.
  await new Promise(r => setTimeout(r, 800))

  const authUrl = `${url}/auth/v1/token?grant_type=password`
  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
  const authJson = await authResponse.json()
  if (!authJson.access_token) {
    throw new Error(
      `[global-setup] Auth REST API failed (${authResponse.status}): ${JSON.stringify(authJson)}`
    )
  }
  console.log(`[global-setup] Signed in as ${email} via REST API`)

  const session = {
    access_token: authJson.access_token,
    refresh_token: authJson.refresh_token,
    token_type: authJson.token_type || 'bearer',
    expires_in: authJson.expires_in,
    user: authJson.user,
    expires_at: authJson.expires_at,
  }

  // ── 2b. Create test farm + barn via PostgREST (user JWT, bypasses RLS) ────
  // The sb_secret_* service-role key doesn't bypass RLS for PostgREST in this
  // project setup.  Use the user's own JWT (authenticated role) instead — the
  // user has RLS access to their own farm and barns.
  const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'
  const restHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${authJson.access_token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Find or create the user's farm
  const farmListRes = await fetch(
    `${url}/rest/v1/farms?user_id=eq.${userId}&select=id,farm_name`,
    { headers: restHeaders }
  )
  const farmList = await farmListRes.json()
  let farmId = farmList?.[0]?.id
  if (!farmId) {
    const farmInsertRes = await fetch(`${url}/rest/v1/farms`, {
      method: 'POST',
      headers: { ...restHeaders, Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: userId, farm_name: 'My Farm', owner_email: email }),
    })
    const farmInserted = await farmInsertRes.json()
    farmId = (Array.isArray(farmInserted) ? farmInserted[0] : farmInserted)?.id
    if (!farmId) throw new Error(`[global-setup] Farm creation failed: ${JSON.stringify(farmInserted)}`)
    console.log('[global-setup] Created farm')
  } else {
    console.log(`[global-setup] Farm already exists (${farmId})`)
  }

  // Find or create the test barn
  const barnListRes = await fetch(
    `${url}/rest/v1/barns?farm_id=eq.${farmId}&select=id,barn_name`,
    { headers: restHeaders }
  )
  const barnList = await barnListRes.json()
  const existingBarn = Array.isArray(barnList) ? barnList.find(b => b.barn_name === BARN_NAME) : null
  let barnId = existingBarn?.id
  if (!barnId) {
    const barnInsertRes = await fetch(`${url}/rest/v1/barns`, {
      method: 'POST',
      headers: { ...restHeaders, Prefer: 'return=representation' },
      body: JSON.stringify({
        farm_id: farmId,
        barn_name: BARN_NAME,
        has_floor_eggs: true,
        two_collections_per_day: true,
        has_bedding: true,
        has_chemicals: true,
      }),
    })
    const barnInserted = await barnInsertRes.json()
    barnId = (Array.isArray(barnInserted) ? barnInserted[0] : barnInserted)?.id
    if (!barnId) throw new Error(`[global-setup] Barn creation failed: ${JSON.stringify(barnInserted)}`)
    console.log(`[global-setup] Created test barn "${BARN_NAME}"`)
  } else {
    console.log(`[global-setup] Test barn "${BARN_NAME}" already exists`)
  }

  // Save farm/barn IDs so helpers can read them without querying Supabase
  fs.writeFileSync(
    path.join(__dirname, '.test-farm-data.json'),
    JSON.stringify({ farmId, farmName: 'My Farm', barnId, barnName: BARN_NAME })
  )

  // ── 3. Inject session into browser localStorage, verify dashboard ─────────
  // Extract the project ref to construct the Supabase JS v2 localStorage key.
  const projectRef = new URL(url).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`

  const browser = await chromium.launch()
  const context = await browser.newContext()

  // Inject the session before the page loads so the React app boots
  // already authenticated (no redirect needed).
  await context.addInitScript(({ key, value }) => {
    window.localStorage.setItem(key, value)
  }, { key: storageKey, value: JSON.stringify(session) })

  const page = await context.newPage()
  await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 30_000 })

  // Wait for the dashboard to confirm auth worked
  await page.waitForSelector('.dashboard', { timeout: 20_000 })

  await context.storageState({ path: AUTH_STATE_PATH })
  console.log(`[global-setup] Auth state saved to ${AUTH_STATE_PATH}`)

  await browser.close()
}
