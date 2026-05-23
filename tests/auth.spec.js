/**
 * auth.spec.js
 *
 * Tests for the authentication system:
 * - Unauthenticated users must see the login page (no auto sign-in)
 * - Invalid credentials show an error and do NOT sign the user in
 * - Valid credentials sign the user in and show the dashboard
 * - Signing out returns to the login page and clears the session
 * - Refreshing the page without a valid session keeps the user on login
 */

import { test, expect } from '@playwright/test'

// These tests must start with NO stored auth state
test.use({ storageState: { cookies: [], origins: [] } })

const BASE = 'http://localhost:5173'

test.describe('Authentication system', () => {
  test('shows login page when no session exists', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('h1')).toContainText('SCSC Compliance Tracker')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Dashboard should NOT be visible
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })

  test('does NOT auto-sign-in when localStorage is empty', async ({ page }) => {
    // Clear all storage and reload
    await page.goto(BASE)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })

  test('shows error with wrong email', async ({ page }) => {
    await page.goto(BASE)
    await page.fill('input[type="email"]', 'nobody@nowhere.invalid')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    // The Login component renders errors via a state variable shown in the DOM
    await expect(page.locator('text=/invalid|error|credentials/i')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })

  test('shows error with correct email but wrong password', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    await page.goto(BASE)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TotallyWrongPassword999!')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/invalid|error|credentials/i')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })

  test('signs in successfully with correct credentials', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    await page.goto(BASE)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    page.on('dialog', d => d.accept())
    await page.click('button[type="submit"]')
    await expect(page.locator('.dashboard')).toBeVisible({ timeout: 20_000 })
    // Header should show the user's email
    await expect(page.locator('.app-header-email')).toContainText(email)
  })

  test('logout clears session and returns to login page', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    // Sign in first
    await page.goto(BASE)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    page.on('dialog', d => d.accept())
    await page.click('button[type="submit"]')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Sign out
    await page.click('button.app-logout-btn')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })

  test('refreshing page after logout stays on login (no auto re-auth)', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    // Sign in
    await page.goto(BASE)
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    page.on('dialog', d => d.accept())
    await page.click('button[type="submit"]')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Sign out, then reload
    await page.click('button.app-logout-btn')
    await page.waitForSelector('input[type="email"]', { timeout: 10_000 })
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('.dashboard')).not.toBeVisible()
  })
})
