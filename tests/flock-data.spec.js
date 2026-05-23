/**
 * flock-data.spec.js
 *
 * Tests Flock Data CRUD:
 * - Requires a barn to be selected
 * - Saves flock_arrival_date and flock_age_at_arrival_weeks to the barns table
 * - Calculates and displays current flock age
 * - Updating saves new values back to Supabase
 * - Data persists (re-loading the form shows saved values)
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm, getTestBarn } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'

test.describe.serial('Flock Data', () => {
  test('shows prompt to select barn when none is selected', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Look for the "Select a barn" message in FlockData
    await expect(page.locator('text=Select a barn to manage flock data')).toBeVisible()
  })

  test('shows the flock data form when a barn is selected', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Select the test barn
    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(500)

    // FlockData section should now show the form
    await expect(page.locator(`text=Flock Data — ${BARN_NAME}`)).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('label:has-text("Flock Arrival Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Age at Arrival")')).toBeVisible()
  })

  test('saves flock_arrival_date and flock_age_at_arrival_weeks to Supabase', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    // Select barn
    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(500)

    // Fill flock arrival date (2 years ago, week 16)
    const arrivalDate = '2024-01-15'
    const ageAtArrival = '16'

    await page.fill('input[type="date"]', arrivalDate)
    await page.fill('input[type="number"][placeholder="e.g. 18"], input[min="0"]', ageAtArrival)

    // Save
    await page.click('button[type="submit"]:has-text("Save")')
    await page.waitForTimeout(1000)

    // Verify in Supabase
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)

    expect(barn.flock_arrival_date).toBe(arrivalDate)
    expect(barn.flock_age_at_arrival_weeks).toBe(parseInt(ageAtArrival))
  })

  test('displays calculated current flock age after saving', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(500)

    // The current flock age display should be visible after data is saved
    await expect(page.locator('text=Current flock age today:')).toBeVisible({ timeout: 5_000 })
    // Should show a number in weeks
    await expect(page.locator('strong:near(:text("Current flock age today:"))')).toContainText(/\d+ weeks/)
  })

  test('updates flock data (re-save with new values updates Supabase)', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(500)

    // Change arrival date and age
    const newDate = '2024-03-01'
    const newAge = '18'

    await page.fill('input[type="date"]', newDate)
    await page.fill('input[type="number"][placeholder="e.g. 18"], input[min="0"]', newAge)
    await page.click('button[type="submit"]:has-text("Save")')
    await page.waitForTimeout(1000)

    // Verify updated values in Supabase
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)

    expect(barn.flock_arrival_date).toBe(newDate)
    expect(barn.flock_age_at_arrival_weeks).toBe(parseInt(newAge))
  })

  test('flock data persists after page reload', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(800)

    // Reload and re-select barn
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.dashboard', { timeout: 20_000 })

    const barnTextAfter = page.locator(`text=${BARN_NAME}`)
    await barnTextAfter.first().click()
    await page.waitForTimeout(800)

    // The date input should have the saved value
    const dateValue = await page.locator('input[type="date"]').inputValue()
    expect(dateValue).toBe('2024-03-01')

    const ageValue = await page.locator('input[type="number"][placeholder="e.g. 18"], input[min="0"]').inputValue()
    expect(ageValue).toBe('18')
  })
})
