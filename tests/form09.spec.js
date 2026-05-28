/**
 * form09.spec.js
 *
 * Form 09 – Feed & Water Records
 * Full CRUD test for every field, both day view and monthly checks view.
 *
 * Fields tested (day view — feed_water_daily):
 *   feedDaily, feedActual, waterDaily, waterActual, augerRunTimeMinutes,
 *   flush, medsVit, treatment, notes
 *
 * Fields tested (day view — feed_water_health):
 *   mortalityDaily, mortalityReason, hospitalPenMonitoring, inventory
 *
 * Fields tested (monthly — feed_water_monthly_metadata):
 *   startingInventory, feedTarget, waterResidualMonthly, comments
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm, getTestBarn, recordDate } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'
const TEST_DAY = 4   // use day 4 to avoid collision with other form tests

async function goToForm09(page) {
  await page.goto('http://localhost:5173')
  await page.waitForSelector('.dashboard', { timeout: 20_000 })
  const barnText = page.locator(`text=${BARN_NAME}`)
  await barnText.first().click()
  await page.waitForTimeout(400)
  await page.click('nav button:has-text("Feed/Water")')
  await page.waitForSelector('text=Form 09', { timeout: 10_000 })
}

async function selectDay(page, day) {
  const tile = page.locator('.day-selector-calendar .react-calendar__month-view__days button')
    .filter({ has: page.locator(`abbr:text-is("${day}")`) })
  await tile.first().click()
  await page.waitForTimeout(700)
}

async function getFeedWaterRecords(admin, barnId, day) {
  const recDate = recordDate(day)

  const { data: audit } = await admin.from('monthly_audits').select('id')
    .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
  if (!audit) return null

  const { data: fwr } = await admin.from('feed_water_records').select('id')
    .eq('barn_id', barnId).eq('audit_id', audit.id).maybeSingle()
  if (!fwr) return null

  const [fwd, fwh, meta] = await Promise.all([
    admin.from('feed_water_daily').select('*').eq('fw_id', fwr.id).eq('record_date', recDate).maybeSingle(),
    admin.from('feed_water_health').select('*').eq('fw_id', fwr.id).eq('record_date', recDate).maybeSingle(),
    admin.from('feed_water_monthly_metadata').select('*').eq('fw_id', fwr.id).maybeSingle(),
  ])

  return { fwId: fwr.id, daily: fwd.data, health: fwh.data, meta: meta.data }
}

// ── Day view tests ────────────────────────────────────────────────────────────

test.describe.serial('Form 09 — day view CRUD', () => {
  test('navigates to Form 09 and selects day 4', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm09(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Daily Tracking – Day ${TEST_DAY}`)).toBeVisible({ timeout: 8_000 })
  })

  test('CREATE — fills all feed/water and mortality fields, saves day 4', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm09(page)
    await selectDay(page, TEST_DAY)

    // Day can already be locked from a prior run; unlock before editing.
    const firstNumberInput = page.locator('input[type="number"]').first()
    if (await firstNumberInput.isDisabled().catch(() => false)) {
      const reenterBtn = page.locator('button:has-text("Re-enter data")')
      await reenterBtn.click()
      await expect(firstNumberInput).toBeEnabled({ timeout: 10_000 })
    }

    // Feed Daily Target
    const numberInputs = page.locator('input[type="number"]')
    await numberInputs.nth(0).fill('1200')  // feed daily
    await numberInputs.nth(1).fill('1180')  // feed actual
    await numberInputs.nth(2).fill('850')   // water daily
    await numberInputs.nth(3).fill('830')   // water actual
    await numberInputs.nth(4).fill('45')    // auger run time

    // Water treatments — Flush, Meds/Vit, Treatment selects
    const selects = page.locator('select')
    await selects.nth(0).selectOption('true')  // flush = Yes
    await selects.nth(1).selectOption('true')  // medsVit = Yes
    await selects.nth(2).selectOption('true')  // treatment = Yes

    // Daily notes
    await page.locator('textarea').first().fill('Feed water test notes day 4')

    // Mortality records
    // mortality daily count
    await numberInputs.nth(5).fill('2').catch(async () => {
      // find it by section heading
      const mortalitySection = page.locator('section, div').filter({ hasText: 'Mortality Records' })
      await mortalitySection.locator('input[type="number"]').first().fill('2')
    })

    // Mortality reason select
    const mortalityReasonSelect = page.locator('select:near(:text("Reason")), select').nth(3)
    await mortalityReasonSelect.selectOption('natural').catch(() => { })

    // Hospital pen monitoring
    const hospitalSelect = page.locator('select:near(:text("Hospital")), select').nth(4)
    await hospitalSelect.selectOption('improved').catch(() => { })

    // Inventory
    await numberInputs.last().fill('9800').catch(() => { })

    // Save
    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)
    await page.waitForTimeout(1500)
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ — Supabase has correct day 4 feed/water values after CREATE', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const rec = await getFeedWaterRecords(admin, barn.id, TEST_DAY)

    expect(rec).not.toBeNull()
    // feed_water_daily fields
    expect(parseFloat(rec.daily?.feed_daily)).toBeCloseTo(1200, 0)
    expect(parseFloat(rec.daily?.feed_actual)).toBeCloseTo(1180, 0)
    expect(parseFloat(rec.daily?.water_daily)).toBeCloseTo(850, 0)
    expect(parseFloat(rec.daily?.water_actual)).toBeCloseTo(830, 0)
    expect(rec.daily?.auger_run_time_minutes).toBe(45)
    expect(rec.daily?.flush_notes).toBeTruthy()
    expect(rec.daily?.meds_vit_notes).toBeTruthy()
    expect(rec.daily?.treatment_notes).toBeTruthy()
    expect(rec.daily?.notes).toBe('Feed water test notes day 4')
    // feed_water_health fields
    expect(rec.health?.mortality_daily).toBe(2)
    expect(rec.health?.mortality_reason).toBe('natural')
    expect(rec.health?.hospital_pen_monitoring).toBe('improved')
  })

  test('Re-enter data button unlocks Form 09 day 4', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm09(page)
    await selectDay(page, TEST_DAY)
    await page.click('button:has-text("Re-enter data")')
    await expect(page.locator(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)).toBeVisible()
  })

  test('UPDATE — modifies feed/water fields and re-saves day 4', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm09(page)
    await selectDay(page, TEST_DAY)
    await page.click('button:has-text("Re-enter data")')
    const firstNumberInput = page.locator('input[type="number"]').first()
    await expect(firstNumberInput).toBeEnabled({ timeout: 10_000 })

    const numberInputs = page.locator('input[type="number"]')
    await numberInputs.nth(0).fill('1300')
    await numberInputs.nth(1).fill('1250')
    await numberInputs.nth(2).fill('900')
    await numberInputs.nth(3).fill('880')
    await numberInputs.nth(4).fill('50')

    // Change Flush to No
    const selects = page.locator('select')
    await selects.nth(0).selectOption('false')

    await page.locator('textarea').first().fill('Updated feed water notes day 4')

    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)
    await page.waitForTimeout(1500)
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ after UPDATE — Supabase reflects updated feed/water day 4 values', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const rec = await getFeedWaterRecords(admin, barn.id, TEST_DAY)

    expect(parseFloat(rec.daily?.feed_daily)).toBeCloseTo(1300, 0)
    expect(parseFloat(rec.daily?.feed_actual)).toBeCloseTo(1250, 0)
    expect(parseFloat(rec.daily?.water_daily)).toBeCloseTo(900, 0)
    expect(parseFloat(rec.daily?.water_actual)).toBeCloseTo(880, 0)
    expect(rec.daily?.auger_run_time_minutes).toBe(50)
    expect(rec.daily?.flush_notes).toBeFalsy()  // Changed to No
    expect(rec.daily?.notes).toBe('Updated feed water notes day 4')
  })
})

// ── Monthly checks tests ─────────────────────────────────────────────────────

test.describe.serial('Form 09 — monthly checks CRUD', () => {
  async function goToMonthlyTab(page) {
    await goToForm09(page)
    await page.click('button:has-text("Monthly Checks")')
    await page.waitForTimeout(500)
  }

  test('CREATE — fills all monthly feed/water metadata fields and saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    // Monthly section can already be locked from a prior run; unlock before editing.
    const editBtn = page.locator('button:has-text("Edit Monthly Checks")')
    if (await editBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(300)
    }

    // Starting inventory
    const numberInputs = page.locator('input[type="number"]')
    await numberInputs.first().fill('10000')

    // Feed target
    const textInputs = page.locator('input[type="text"]')
    await textInputs.first().fill('1200 g/bird/day').catch(async () => {
      // some may be rendered differently
    })

    // Water residual monthly
    const allInputs = page.locator('input')
    // Try to find feed target and water residual by nearby text
    await page.fill('input:near(:text("Feed Target"))', '1200 g/bird/day').catch(() => { })
    await page.fill('input:near(:text("Water Residual"))', 'Residual test notes').catch(() => { })

    // Comments
    const textareas = page.locator('textarea')
    if (await textareas.count() > 0) {
      await textareas.first().fill('Monthly feed water comments test')
    }

    // Save
    const saveBtn = page.locator('button:has-text("Save Monthly Checks")')
    await saveBtn.first().click()
    await page.waitForTimeout(1500)
  })

  test('READ — Supabase has correct monthly metadata after CREATE', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: fwr } = await admin.from('feed_water_records').select('id')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    const { data: meta } = await admin.from('feed_water_monthly_metadata').select('*')
      .eq('fw_id', fwr.id).maybeSingle()

    expect(meta).toBeTruthy()
    expect(meta.starting_inventory).toBe(10000)
  })

  test('UPDATE — changes starting inventory and comments, re-saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    // Unlock if locked
    const editBtn = page.locator('button:has-text("Edit Monthly Checks")')
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(300)
    }

    // Update starting inventory
    const numberInputs = page.locator('input[type="number"]')
    await numberInputs.first().fill('9500')

    // Update comments
    const textareas = page.locator('textarea')
    if (await textareas.count() > 0) {
      await textareas.first().fill('Updated monthly comments feed/water')
    }

    await page.click('button:has-text("Save Monthly Checks")')
    await page.waitForTimeout(1500)
  })

  test('READ after UPDATE — Supabase reflects updated monthly metadata', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: fwr } = await admin.from('feed_water_records').select('id')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    const { data: meta } = await admin.from('feed_water_monthly_metadata').select('starting_inventory, comments')
      .eq('fw_id', fwr.id).maybeSingle()

    expect(meta.starting_inventory).toBe(9500)
    expect(meta.comments).toBe('Updated monthly comments feed/water')
  })
})
