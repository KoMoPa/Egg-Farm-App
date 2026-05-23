/**
 * global-teardown.js
 *
 * Runs once after all Playwright tests.
 * Deletes the test user (and all cascaded data via FK) from Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default async function globalTeardown() {
  const idFile = path.join(__dirname, '.test-user-id.json')
  if (!fs.existsSync(idFile)) {
    console.log('[global-teardown] No test user ID file found — skipping cleanup')
    return
  }

  const { userId, email } = JSON.parse(fs.readFileSync(idFile, 'utf8'))
  const { VITE_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env

  if (!url || !serviceKey) {
    console.warn('[global-teardown] Missing Supabase env vars — skipping cleanup')
    return
  }

  const adminSupabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) {
    console.error(`[global-teardown] Failed to delete test user ${email}: ${error.message}`)
  } else {
    console.log(`[global-teardown] Deleted test user ${email} (${userId}) and all cascaded data`)
  }

  // Clean up temp files
  fs.rmSync(idFile, { force: true })
  const authState = path.join(__dirname, '.auth-state.json')
  fs.rmSync(authState, { force: true })
  fs.rmSync(path.join(__dirname, '.test-farm-data.json'), { force: true })
}
