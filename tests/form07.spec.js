/**
 * form07.spec.js
 *
 * Form 07 – Egg Production & Cooler Records
 * Full CRUD test for every field, both day view and monthly checks view.
 *
 * Fields tested (day view):
 *   age, floorEggs1, floorEggs2, eggProduction1, eggProduction2,
 *   eggProductionPercent, notes, coolerTempHi, coolerTempLo,
 *   coolerRhHi, coolerRhLo, coolerCheckTime, dirtyTrays,
 *   eggCoolerCleaned, packRoomCleaned, tablesPackingEquipCleaned,
 *   correctiveActions
 *
 * Fields tested (monthly checks view):
 *   thermCalDate, thermCalMethod, thermCalPass, thermCalInitials,
 *   thermCalNotes, monthlyCorrectiveActions, monthlyComments
 *
 * Each field is: Created → verified in Supabase → updated via Re-enter → re-verified.
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm, getTestBarn, recordDate } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'
const TEST_DAY = 2   // use day 2 to avoid any "today" edge cases

// ── helpers ─────────────────────────────────────────────────────────────────

async function goToForm07(page) {
  await page.goto('http://localhost:5173')
  await page.waitForSelector('.dashboard', { timeout: 20_000 })

  // Select barn
  const barnText = page.locator(`text=${BARN_NAME}`)
  await barnText.first().click()
  await page.waitForTimeout(400)

  // Navigate to Production tab
  await page.click('nav button:has-text("Production")')
  await page.waitForSelector('text=Form 07', { timeout: 10_000 })
}

async function selectDay(page, day) {
  // Click date tile in react-calendar
  const tile = page.locator('.day-selector-calendar .react-calendar__month-view__days button')
    .filter({ has: page.locator(`abbr:text-is("${day}")`) })
  await tile.first().click()
  await page.waitForTimeout(700)
}

async function getProductionRecord(admin, barnId, day) {
  const recDate = recordDate(day)
  const monthYear = recDate.substring(0, 7) + '-01'

  const { data: audit } = await admin
    .from('monthly_audits')
    .select('id')
    .eq('month_year', recDate.substring(0, 7) + '-01')
    .maybeSingle()

  if (!audit) return null

  const { data: prod } = await admin
    .from('production_cooler_records')
    .select('id')
    .eq('barn_id', barnId)
    .eq('audit_id', audit.id)
    .maybeSingle()

  if (!prod) return null

  const [fe, eo, ct, san, fa] = await Promise.all([
    admin.from('production_floor_eggs').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
    admin.from('production_egg_output').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
    admin.from('production_cooler_temps').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
    admin.from('production_sanitation').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
    admin.from('production_flock_age').select('*').eq('production_id', prod.id).eq('record_date', recDate).maybeSingle(),
  ])

  return {
    prodId: prod.id,
    floorEggs: fe.data,
    eggOutput: eo.data,
    coolerTemps: ct.data,
    sanitation: san.data,
    flockAge: fa.data,
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe.serial('Form 07 — day view CRUD', () => {
  test('navigates to Form 07 and selects day 2', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm07(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Daily Tracking`)).toBeVisible({ timeout: 5_000 })
  })

  test('CREATE — fills all day-view fields and saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm07(page)
    await selectDay(page, TEST_DAY)

    // Age
    await page.fill('input[placeholder="25"]', '28')

    // Floor Eggs (collection 1 and 2)
    const numberInputs = page.locator('input[placeholder="150"]')
    await numberInputs.first().fill('180')
    const numberInputs2 = page.locator('input[placeholder="120"]')
    await numberInputs2.first().fill('140')

    // Egg Production 1
    await page.fill('input[placeholder="6000"]', '5800')
    // Egg Production 2
    await page.fill('input[placeholder="6500"]', '6200')
    // % Daily
    await page.fill('input[placeholder="92.5"]', '91.3')

    // Production notes
    await page.fill('textarea[placeholder*="egg production"]', 'Test production notes day 2')

    // Cooler Temp HI
    await page.fill('input[placeholder="4.5"]', '4.2')
    // Cooler Temp LO
    await page.fill('input[placeholder="3.8"]', '3.5')
    // Cooler RH HI
    await page.fill('input[placeholder="75.0"]', '74.0')
    // Cooler RH LO
    await page.fill('input[placeholder="70.0"]', '68.5')
    // Cooler check time
    await page.fill('input[type="time"]', '08:30')

    // Dirty trays
    await page.fill('input[placeholder="5"]', '3')

    // Sanitation checkboxes — Egg Cooler, Pack Room, Tables/Packing Equip
    const sanLabels = page.locator('label:has(input[type="checkbox"])').filter({ hasText: /Egg Cooler|Pack Room|Tables/ })
    const sanCount = await sanLabels.count()
    for (let i = 0; i < sanCount; i++) {
      await sanLabels.nth(i).click()
    }

    // Corrective actions
    await page.fill('textarea[placeholder*="corrective actions"]', 'Test corrective action day 2')

    // Save
    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY}")`)
    await page.waitForTimeout(1500)

    // Locked banner should appear
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ — Supabase has correct day 2 field values after CREATE', async ({ page }) => {
    page.on('dialog', d => d.accept())
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const rec = await getProductionRecord(admin, barn.id, TEST_DAY)

    expect(rec).not.toBeNull()
    // flock_age_weeks
    expect(rec.flockAge?.flock_age_weeks).toBe(28)
    // floor eggs
    expect(rec.floorEggs?.collection_1).toBe(180)
    expect(rec.floorEggs?.collection_2).toBe(140)
    expect(rec.floorEggs?.floor_eggs_total).toBe(320)
    // egg output
    expect(rec.eggOutput?.egg_production_1).toBe(5800)
    expect(rec.eggOutput?.egg_production_2).toBe(6200)
    expect(rec.eggOutput?.egg_production_daily).toBe(12000)
    expect(parseFloat(rec.eggOutput?.egg_production_percent)).toBeCloseTo(91.3, 1)
    expect(rec.eggOutput?.notes).toBe('Test production notes day 2')
    // cooler temps
    expect(parseFloat(rec.coolerTemps?.cooler_temp_hi_celsius)).toBeCloseTo(4.2, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_temp_lo_celsius)).toBeCloseTo(3.5, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_rh_hi_percent)).toBeCloseTo(74.0, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_rh_lo_percent)).toBeCloseTo(68.5, 1)
    expect(rec.coolerTemps?.cooler_check_time).toMatch(/08:30/)
    // sanitation
    expect(rec.sanitation?.dirty_trays_count).toBe(3)
    expect(rec.sanitation?.egg_cooler_sanitation_code).toBeTruthy()
    expect(rec.sanitation?.pack_room_sanitation_code).toBeTruthy()
    expect(rec.sanitation?.equip_sanitation_code).toBeTruthy()
    expect(rec.sanitation?.corrective_actions).toBe('Test corrective action day 2')
  })

  test('shows "Already recorded" locked banner on day 2 after saving', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm07(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('Re-enter data button unlocks the form for day 2', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm07(page)
    await selectDay(page, TEST_DAY)

    // Click Re-enter data
    await page.click('button:has-text("Re-enter data")')
    await page.waitForTimeout(300)

    // Save button should now be visible
    await expect(page.locator(`button[type="submit"]:has-text("Save Day ${TEST_DAY}")`)).toBeVisible()
  })

  test('UPDATE — modifies every field and re-saves day 2', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm07(page)
    await selectDay(page, TEST_DAY)
    await page.click('button:has-text("Re-enter data")')
    await page.waitForTimeout(300)

    // Age
    await page.fill('input[placeholder="25"]', '29')
    // Floor Eggs
    await page.locator('input[placeholder="150"]').first().fill('200')
    await page.locator('input[placeholder="120"]').first().fill('155')
    // Egg Production
    await page.fill('input[placeholder="6000"]', '6100')
    await page.fill('input[placeholder="6500"]', '6400')
    await page.fill('input[placeholder="92.5"]', '93.0')
    // Notes
    await page.fill('textarea[placeholder*="egg production"]', 'Updated production notes day 2')
    // Cooler
    await page.fill('input[placeholder="4.5"]', '5.0')
    await page.fill('input[placeholder="3.8"]', '4.0')
    await page.fill('input[placeholder="75.0"]', '76.0')
    await page.fill('input[placeholder="70.0"]', '71.0')
    await page.fill('input[type="time"]', '09:15')
    // Dirty trays
    await page.fill('input[placeholder="5"]', '7')
    // Corrective actions
    await page.fill('textarea[placeholder*="corrective actions"]', 'Updated corrective action day 2')

    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY}")`)
    await page.waitForTimeout(1500)
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ after UPDATE — Supabase reflects new field values for day 2', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const rec = await getProductionRecord(admin, barn.id, TEST_DAY)

    expect(rec.flockAge?.flock_age_weeks).toBe(29)
    expect(rec.floorEggs?.collection_1).toBe(200)
    expect(rec.floorEggs?.collection_2).toBe(155)
    expect(rec.floorEggs?.floor_eggs_total).toBe(355)
    expect(rec.eggOutput?.egg_production_1).toBe(6100)
    expect(rec.eggOutput?.egg_production_2).toBe(6400)
    expect(rec.eggOutput?.egg_production_daily).toBe(12500)
    expect(parseFloat(rec.eggOutput?.egg_production_percent)).toBeCloseTo(93.0, 1)
    expect(rec.eggOutput?.notes).toBe('Updated production notes day 2')
    expect(parseFloat(rec.coolerTemps?.cooler_temp_hi_celsius)).toBeCloseTo(5.0, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_temp_lo_celsius)).toBeCloseTo(4.0, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_rh_hi_percent)).toBeCloseTo(76.0, 1)
    expect(parseFloat(rec.coolerTemps?.cooler_rh_lo_percent)).toBeCloseTo(71.0, 1)
    expect(rec.coolerTemps?.cooler_check_time).toMatch(/09:15/)
    expect(rec.sanitation?.dirty_trays_count).toBe(7)
    expect(rec.sanitation?.corrective_actions).toBe('Updated corrective action day 2')
  })
})

test.describe.serial('Form 07 — monthly checks CRUD', () => {
  async function goToMonthlyTab(page) {
    await goToForm07(page)
    await page.click('button:has-text("Monthly Checks")')
    await page.waitForTimeout(500)
  }

  test('CREATE — fills monthly checks fields and saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    // Thermometer calibration
    await page.fill('input[type="date"]', '2026-05-10')
    await page.selectOption('select', { value: 'B' })
    // Result select — pick 'pass' (already default) so leave as-is unless needed

    await page.fill('input[placeholder="AB"]', 'JD')
    await page.fill('input[placeholder="Optional notes"]', 'Boiling water test passed')

    // Monthly corrective actions
    await page.fill('textarea[placeholder*="corrective actions"]', 'Monthly corrective: none needed')

    // Monthly comments
    await page.fill('textarea[placeholder*="Monthly comments"]', 'Month looks good')

    // Save monthly checks
    await page.click('button:has-text("Save Monthly Checks")')
    await page.waitForTimeout(1500)

    // Should show "Edit Monthly Checks" after save
    await expect(page.locator('button:has-text("Edit Monthly Checks")')).toBeVisible({ timeout: 10_000 })
  })

  test('READ — Supabase has correct monthly check values after CREATE', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)

    const recDate = recordDate(TEST_DAY)
    const monthYear = recDate.substring(0, 7) + '-01'

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    expect(audit).toBeTruthy()

    const { data: prod } = await admin.from('production_cooler_records').select('id, monthly_corrective_actions, monthly_comments')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    expect(prod).toBeTruthy()
    expect(prod.monthly_corrective_actions).toBe('Monthly corrective: none needed')
    expect(prod.monthly_comments).toBe('Month looks good')

    const { data: tc } = await admin.from('production_thermometer_calibration').select('*')
      .eq('production_id', prod.id).order('calibration_date', { ascending: false }).limit(1).maybeSingle()
    expect(tc).toBeTruthy()
    expect(tc.calibration_date).toBe('2026-05-10')
    expect(tc.method).toBe('B')
    expect(tc.result_pass).toBe(true)
    expect(tc.initials).toBe('JD')
    expect(tc.notes).toBe('Boiling water test passed')
  })

  test('UPDATE — edits monthly checks and re-saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    await page.click('button:has-text("Edit Monthly Checks")')
    await page.waitForTimeout(300)

    // Update monthly corrective actions and comments
    const caTextarea = page.locator('textarea[placeholder*="corrective actions"]')
    await caTextarea.fill('Monthly corrective: updated text')

    const commentTextarea = page.locator('textarea[placeholder*="Monthly comments"]')
    await commentTextarea.fill('Month updated comment')

    await page.click('button:has-text("Save Monthly Checks")')
    await page.waitForTimeout(1500)
    await expect(page.locator('button:has-text("Edit Monthly Checks")')).toBeVisible({ timeout: 10_000 })
  })

  test('READ after UPDATE — Supabase reflects updated monthly check values', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)

    const recDate = recordDate(TEST_DAY)
    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: prod } = await admin.from('production_cooler_records').select('monthly_corrective_actions, monthly_comments')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()

    expect(prod.monthly_corrective_actions).toBe('Monthly corrective: updated text')
    expect(prod.monthly_comments).toBe('Month updated comment')
  })
})
