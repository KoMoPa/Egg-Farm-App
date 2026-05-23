/**
 * reports.spec.js
 *
 * Reports page tests:
 * - Reports section loads and shows the current month's audit
 * - After form data has been saved (by earlier form tests), the barn
 *   form status boxes show each form as started
 * - Marking a month complete sets form_XX_completed flags in Supabase
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm, getTestBarn, recordDate } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'

async function goToReports(page) {
  await page.goto('http://localhost:5173')
  await page.waitForSelector('.dashboard', { timeout: 20_000 })
  await page.click('nav button:has-text("Reports")')
  await page.waitForSelector('text=Monthly Compliance Reports', { timeout: 10_000 })
}

test.describe.serial('Reports page', () => {
  test('navigates to Reports section', async ({ page }) => {
    await goToReports(page)
    await expect(page.locator('text=Monthly Compliance Reports')).toBeVisible()
  })

  test('shows at least one monthly audit entry', async ({ page }) => {
    await goToReports(page)
    // The current month audit should be present (created by earlier form tests)
    await expect(page.locator('text=2026').or(page.locator('text=May'))).toBeVisible({ timeout: 8_000 })
  })

  test('shows barn form status — select barn to see form statuses', async ({ page }) => {
    await goToReports(page)
    // Select the test barn
    const barnBtn = page.locator(`text=${BARN_NAME}`)
    if (await barnBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await barnBtn.click()
      await page.waitForTimeout(800)
    }
    // After selecting barn, form status boxes should be visible
    // The barn has records for Forms 07, 08, 09, 10 from previous tests
    // Status boxes show either "✓ Complete" or "N days left"
    const statusElements = page.locator('text=✓ Complete').or(page.locator('text=days left'))
    await expect(statusElements.first()).toBeVisible({ timeout: 10_000 })
  })

  test('Supabase has records for all 4 forms after prior CRUD tests', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(2)  // form07 used day 2

    const monthPrefix = recDate.substring(0, 7)
    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', monthPrefix + '-01').maybeSingle()
    expect(audit).not.toBeNull()

    const [r07, r08, r09, r10] = await Promise.all([
      admin.from('production_cooler_records').select('id').eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle(),
      admin.from('welfare_records').select('id').eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle(),
      admin.from('feed_water_records').select('id').eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle(),
      admin.from('pest_control_records').select('id').eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle(),
    ])

    expect(r07.data, 'Form 07 production_cooler_records should exist').not.toBeNull()
    expect(r08.data, 'Form 08 welfare_records should exist').not.toBeNull()
    expect(r09.data, 'Form 09 feed_water_records should exist').not.toBeNull()
    expect(r10.data, 'Form 10 pest_control_records should exist').not.toBeNull()
  })

  test('Mark Month Complete sets form_07_completed flag in Supabase via Form 07', async ({ page }) => {
    page.on('dialog', d => d.accept())

    // Navigate to Form 07
    await page.goto('http://localhost:5173')
    await page.waitForSelector('.dashboard', { timeout: 20_000 })
    const barnText = page.locator(`text=${BARN_NAME}`)
    await barnText.first().click()
    await page.waitForTimeout(400)
    await page.click('nav button:has-text("Production")')
    await page.waitForSelector('text=Form 07', { timeout: 10_000 })

    // Switch to Monthly Checks view
    await page.click('button:has-text("Monthly Checks")')
    await page.waitForTimeout(500)

    // Click "✓ Mark Month Complete" button
    await page.click('button:has-text("Mark Month Complete")')
    await page.waitForTimeout(1500)

    // Verify in Supabase
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const recDate = recordDate(2)
    const { data: audit } = await admin.from('monthly_audits').select('form_07_completed')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()

    expect(audit?.form_07_completed).toBe(true)
  })
})
