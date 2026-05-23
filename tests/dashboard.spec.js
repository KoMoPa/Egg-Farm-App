/**
 * dashboard.spec.js
 *
 * Tests the dashboard initial state and barn creation:
 * - Dashboard renders all four sections (BarnManager, Reports, FlockData, Analytics)
 * - A barn can be created with all option toggles (floor eggs, two collections, bedding, chemicals)
 * - After creating a barn and selecting it, Reports shows "0 days left" or no completed forms
 * - Analytics renders chart sections even with no data
 * - Analytics goals can be set, edited, and cleared (persisted in localStorage)
 *
 * These tests use the shared authenticated test user (storageState from global-setup).
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'

test.describe.serial('Dashboard and barn creation', () => {
  test('dashboard loads with all four sections visible', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    await expect(page.locator('.dashboard')).toBeVisible()
    // BarnManager section
    await expect(page.locator('.barn-manager')).toBeVisible()
    // Reports section
    await expect(page.locator('h2:has-text("Compliance")')).toBeVisible()
    // Flock Data section
    await expect(page.locator('h2:has-text("Flock Data")')).toBeVisible()
    // Analytics section
    await expect(page.locator('.analytics')).toBeVisible()
  })

  test('creates a barn via UI and verifies in Supabase', async ({ page }) => {
    // Use a separate name so it doesn't conflict with the global-setup infrastructure barn
    const UI_BARN = 'E2E UI Test Barn'
    page.on('dialog', d => d.accept())
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Click "Add New Barn" button in BarnManager
    await page.click('button:has-text("Add New Barn")')

    // Fill in barn name
    await page.fill('input[placeholder*="Barn"]', UI_BARN)

    // Toggle all options (has_floor_eggs, two_collections_per_day, has_bedding, has_chemicals)
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i)
      const checked = await cb.isChecked()
      if (!checked) await cb.check()
    }

    // Submit
    await page.click('button[type="submit"]:has-text("Create Barn")')
    await page.waitForTimeout(1000)

    // Verify barn was created in Supabase
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    expect(farm).toBeTruthy()

    const { data: barn } = await admin
      .from('barns')
      .select('*')
      .eq('farm_id', farm.id)
      .eq('barn_name', UI_BARN)
      .maybeSingle()
    expect(barn).toBeTruthy()
    expect(barn.barn_name).toBe(UI_BARN)
    expect(barn.has_floor_eggs).toBe(true)
    expect(barn.two_collections_per_day).toBe(true)
    expect(barn.has_bedding).toBe(true)
    expect(barn.has_chemicals).toBe(true)
  })

  test('Reports section shows no forms completed for new barn', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Select the test barn if not already selected
    const barnText = page.locator(`text=${BARN_NAME}`)
    if (await barnText.isVisible()) await barnText.click()

    // The Reports component should show "days left" badges (not "✓ Complete")
    // For a brand new barn there should be no "✓ Complete" indicators
    const completeLabels = page.locator('text=✓ Complete')
    await expect(completeLabels).toHaveCount(0, { timeout: 5_000 })

    // Should show some audit month(s) or an empty-state message
    // At minimum, no crashes
    await expect(page.locator('.dashboard')).toBeVisible()
  })

  test('Analytics section renders all three chart titles', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    await expect(page.locator('text=⚙️ Auger Run Time')).toBeVisible()
    await expect(page.locator('text=🌾 Feed')).toBeVisible()
    await expect(page.locator('text=💧 Water')).toBeVisible()
  })

  test('Analytics shows "No goal set" and allows setting a goal', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Initially no goals (localStorage may be empty for a fresh test user)
    // Clear analytics goals to start clean
    await page.evaluate(() => localStorage.removeItem('analytics_goals'))
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.dashboard')

    // "No goal set" should appear for at least one chart
    const noGoal = page.locator('text=No goal set').first()
    await expect(noGoal).toBeVisible()

    // Click "Set goal" for the first chart (Auger Run Time)
    const setGoalBtn = page.locator('button:has-text("Set goal")').first()
    await setGoalBtn.click()

    // Input should appear
    const goalInput = page.locator('.chart-goal-input')
    await expect(goalInput).toBeVisible()
    await goalInput.fill('45')

    // Confirm save
    await page.click('button.chart-goal-btn--save')

    // Goal value should now be displayed
    await expect(page.locator('text=Goal: 45')).toBeVisible()

    // Verify persisted in localStorage
    const stored = await page.evaluate(() => localStorage.getItem('analytics_goals'))
    const goals = JSON.parse(stored)
    expect(goals.auger_run_time_minutes).toBe(45)
  })

  test('Analytics allows editing an existing goal', async ({ page }) => {
    // Start with goal=45 set in previous test (localStorage)
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Pre-set a known goal
    await page.evaluate(() => localStorage.setItem('analytics_goals', JSON.stringify({ auger_run_time_minutes: 45 })))
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.dashboard')

    const editBtn = page.locator('button:has-text("Edit")').first()
    await editBtn.click()
    const goalInput = page.locator('.chart-goal-input')
    await goalInput.fill('60')
    await page.click('button.chart-goal-btn--save')

    await expect(page.locator('text=Goal: 60')).toBeVisible()
    const stored = await page.evaluate(() => localStorage.getItem('analytics_goals'))
    expect(JSON.parse(stored).auger_run_time_minutes).toBe(60)
  })

  test('Analytics allows clearing a goal', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    await page.evaluate(() => localStorage.setItem('analytics_goals', JSON.stringify({ auger_run_time_minutes: 60 })))
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.dashboard')

    const editBtn = page.locator('button:has-text("Edit")').first()
    await editBtn.click()
    await page.click('button.chart-goal-btn--clear')

    await expect(page.locator('text=No goal set').first()).toBeVisible()
    const stored = await page.evaluate(() => localStorage.getItem('analytics_goals'))
    const goals = JSON.parse(stored)
    expect(goals.auger_run_time_minutes).toBeUndefined()
  })
})
