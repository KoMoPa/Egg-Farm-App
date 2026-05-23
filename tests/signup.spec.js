/**
 * signup.spec.js
 *
 * Tests the sign-up flow:
 * - Toggling to sign-up mode shows the correct UI
 * - Creating a new account (using a unique temp email) goes through
 * - After sign-up, the farm is automatically created in Supabase
 *
 * NOTE: These tests use a *temporary* unique email (not the shared test user)
 * and clean up via the admin API after each test.
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

test.use({ storageState: { cookies: [], origins: [] } })

function tempEmail() {
  return `e2e-signup-${Date.now()}@eggtestfarm.invalid`
}

function adminClient() {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function deleteUserByEmail(email) {
  const admin = adminClient()
  const { data: { users } } = await admin.auth.admin.listUsers()
  const u = users.find(x => x.email === email)
  if (u) await admin.auth.admin.deleteUser(u.id)
}

test.describe('Sign-up flow', () => {
  test('clicking "Create Account" link shows sign-up mode', async ({ page }) => {
    await page.goto('http://localhost:5173')
    // The Login component has a link/button to switch modes
    const toggle = page.locator('button:has-text("Create Account"), a:has-text("Create Account"), span:has-text("Create Account")')
    await expect(toggle).toBeVisible()
    await toggle.click()
    await expect(page.locator('text=Create an Account')).toBeVisible()
    // Should still show email + password inputs
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('signing up creates a Supabase auth user and a farm record', async ({ page }) => {
    const email = tempEmail()
    const password = 'SignupTest@2026!'

    await page.goto('http://localhost:5173')

    // Switch to sign-up mode
    const toggle = page.locator('button:has-text("Create Account"), a:has-text("Create Account"), span:has-text("Create Account")')
    await toggle.click()

    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    page.on('dialog', d => d.accept())
    await page.click('button[type="submit"]')

    // The login component shows a success message on sign-up
    // (either redirect to dashboard OR show "check your email" message)
    const successMsg = page.locator('text=/signup successful|check your email|dashboard/i')
    await expect(successMsg).toBeVisible({ timeout: 15_000 })

    // Verify the user was created in Supabase
    const admin = adminClient()
    const { data: { users } } = await admin.auth.admin.listUsers()
    const created = users.find(u => u.email === email)
    expect(created).toBeTruthy()
    expect(created.email).toBe(email)

    // If email confirmation is disabled, the farm should also be created.
    // NOTE: The sb_secret_* service key does not bypass RLS for PostgREST in
    // this Supabase project (see global-setup.js). Sign in as the new user with
    // the anon key to query their farm (same approach as global-setup.js).
    if (created.email_confirmed_at) {
      const userClient = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await userClient.auth.signInWithPassword({ email, password })
      const { data: farm } = await userClient.from('farms').select('*').eq('user_id', created.id).maybeSingle()
      expect(farm).toBeTruthy()
      expect(farm.farm_name).toBe('My Farm')
      await userClient.auth.signOut()
    }

    // Cleanup
    await deleteUserByEmail(email)
  })

  test('signing in with newly created credentials shows dashboard', async ({ page }) => {
    const admin = adminClient()
    const email = tempEmail()
    const password = 'SignupDash@2026!'

    // Pre-create the user via admin API (bypasses email confirm)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    expect(error).toBeNull()

    await page.goto('http://localhost:5173')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    page.on('dialog', d => d.accept())
    await page.click('button[type="submit"]')
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 20_000 })

    // Cleanup
    await admin.auth.admin.deleteUser(data.user.id)
  })
})
