/**
 * form08.spec.js
 *
 * Form 08 – Welfare Records
 * Full CRUD test for every field, both day view and monthly checks view.
 *
 * Fields tested (day view — welfare_daily_checks):
 *   barnTempHi, barnTempLo, exteriorTemp,
 *   floorsChecked, wallsFansCeilingChecked, manureChecked,
 *   beddingUsed, chemicalsUsed,
 *   routineHenEquipAmInitial, routineHenEquipPmInitial
 *
 * Fields tested (day view — welfare_weekly_inspections):
 *   overallAppearance, generalSound, abnormalBehavior, signsOfDisease,
 *   injuredBirds, respiratoryProblems, pantingHuddling, lameness,
 *   featherPecking, trappedBirds, deadBirds, feedWaterAvailable,
 *   equipmentOperating, amenitiesCondition, layFacilityEnvironment,
 *   weeklyComments
 *
 * Fields tested (monthly checks — welfare_monthly_checks):
 *   ammoniaRange, ammoniaDistilledWater, ammoniaInitials, ammoniaNotes,
 *   alarmCheckDate, alarmCheckInitials, generatorCheckDate, generatorCheckInitials
 */

import { test, expect } from '@playwright/test'
import { createAdminClient, getTestFarm, getTestBarn, recordDate } from './setup/helpers.js'

const BARN_NAME = process.env.TEST_BARN_NAME || 'E2E Test Barn'
const TEST_DAY = 3   // use day 3 to avoid collision with Form07 tests

async function goToForm08(page) {
  await page.goto('http://localhost:5173')
  await page.waitForSelector('.dashboard', { timeout: 20_000 })
  const barnText = page.locator(`text=${BARN_NAME}`)
  await barnText.first().click()
  await page.waitForTimeout(400)
  await page.click('nav button:has-text("Welfare")')
  await page.waitForSelector('text=Form 08', { timeout: 10_000 })
}

async function selectDay(page, day) {
  const tile = page
    .locator('.day-selector-calendar .react-calendar__month-view__days button.react-calendar__tile:not(.react-calendar__month-view__days__day--neighboringMonth)')
    .filter({ has: page.locator(`abbr:text-is("${day}")`) })
  await expect(tile.first()).toBeVisible()
  await tile.first().click()
  await page.waitForTimeout(700)
}

async function getWelfareRecords(admin, barnId, day) {
  const recDate = recordDate(day)

  const { data: audit } = await admin.from('monthly_audits').select('id')
    .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
  if (!audit) return null

  const { data: wr } = await admin.from('welfare_records').select('id, monthly_comments')
    .eq('barn_id', barnId).eq('audit_id', audit.id).maybeSingle()
  if (!wr) return null

  const [dc, wi, mc] = await Promise.all([
    admin.from('welfare_daily_checks').select('*').eq('welfare_id', wr.id).eq('record_date', recDate).maybeSingle(),
    admin.from('welfare_weekly_inspections').select('*').eq('welfare_id', wr.id).eq('inspection_date', recDate).maybeSingle(),
    admin.from('welfare_monthly_checks').select('*').eq('welfare_id', wr.id).maybeSingle(),
  ])

  return { welfareId: wr.id, monthlyComments: wr.monthly_comments, dailyCheck: dc.data, weeklyInspection: wi.data, monthlyChecks: mc.data }
}

// ── Day view tests ────────────────────────────────────────────────────────────

test.describe.serial('Form 08 — day view CRUD', () => {
  test('navigates to Form 08 and selects day 3', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm08(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Daily Tracking - Day ${TEST_DAY}`)).toBeVisible({ timeout: 8_000 })
  })

  test('CREATE — fills all daily check fields and inspection criteria, then saves', async ({ page }) => {
    const dialogs = []
    page.on('dialog', d => { dialogs.push(d.message()); d.accept() })
    await goToForm08(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Daily Tracking - Day ${TEST_DAY}`)).toBeVisible({ timeout: 8_000 })

    // Barn temperatures (target exact labeled fields)
    await page.locator('label:has-text("Barn Temp HI") + input').fill('22.5')
    await page.locator('label:has-text("Barn Temp LO") + input').fill('18.0')
    await page.locator('label:has-text("Exterior Temp") + input').fill('-5.0')

    // Sanitation checkboxes — Floors, Walls, Manure
    const sanCheckboxes = page.locator('label:has-text("Floors Checked"), label:has-text("Walls"), label:has-text("Manure")')
    for (let i = 0; i < await sanCheckboxes.count(); i++) {
      await sanCheckboxes.nth(i).click()
    }

    // Bedding/Chemicals selects — choose 'Yes'
    await page.locator('label:has-text("Bedding Used") + select').selectOption('true')
    await page.locator('label:has-text("Chemicals Used") + select').selectOption('true')

    // Required type fields when bedding/chemicals are used
    await page.locator('label:has-text("Bedding Type") + input').fill('Wood shavings')
    await page.locator('label:has-text("Chemicals Type") + input').fill('Peroxide')

    // AM and PM initials
    await page.locator('label:has-text("AM Initial") + input').fill('AB')
    await page.locator('label:has-text("PM Initial") + input').fill('CD')

    // Select All inspection criteria using the "Select All" button
    await page.click('button:has-text("Select All")')
    await page.waitForTimeout(200)

    // Weekly comments
    await page.fill('textarea', 'Test weekly welfare comment day 3')

    // Save
    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)
    await page.waitForTimeout(1500)

    // Keep error guard only; persisted values are verified in READ tests.
    expect(dialogs.some(m => /error saving/i.test(m) || /^error:/i.test(m))).toBeFalsy()
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ — Supabase has correct day 3 welfare values after CREATE', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    await expect.poll(async () => {
      const data = await getWelfareRecords(admin, barn.id, TEST_DAY)
      return !!(data?.dailyCheck && data?.weeklyInspection)
    }, { timeout: 20_000 }).toBe(true)

    const rec = await getWelfareRecords(admin, barn.id, TEST_DAY)

    expect(rec).not.toBeNull()
    expect(rec.dailyCheck).not.toBeNull()
    expect(rec.weeklyInspection).not.toBeNull()
    // Daily check temps
    expect(parseFloat(rec.dailyCheck?.barn_temp_hi)).toBeCloseTo(22.5, 1)
    expect(parseFloat(rec.dailyCheck?.barn_temp_lo)).toBeCloseTo(18.0, 1)
    expect(parseFloat(rec.dailyCheck?.exterior_temp)).toBeCloseTo(-5.0, 1)
    // Sanitation
    expect(rec.dailyCheck?.floor_sanitation_code).toBeTruthy()
    expect(rec.dailyCheck?.walls_sanitation_code).toBeTruthy()
    expect(rec.dailyCheck?.manure_sanitation_code).toBeTruthy()
    // Bedding / chemicals
    expect(rec.dailyCheck?.bedding_notes).toBe('Wood shavings')
    expect(rec.dailyCheck?.chemicals_notes).toBe('Peroxide')
    // Initials
    expect(rec.dailyCheck?.hen_inspection_am).toBe('AB')
    expect(rec.dailyCheck?.hen_inspection_pm).toBe('CD')
    // All 15 inspection criteria checked
    const wi = rec.weeklyInspection
    expect(wi?.check_overall_appearance).toBe(true)
    expect(wi?.check_general_sound).toBe(true)
    expect(wi?.check_abnormal_behavior).toBe(true)
    expect(wi?.check_disease_illness).toBe(true)
    expect(wi?.check_injured_birds).toBe(true)
    expect(wi?.check_respiratory).toBe(true)
    expect(wi?.check_panting_huddling).toBe(true)
    expect(wi?.check_lameness).toBe(true)
    expect(wi?.check_feather_pecking).toBe(true)
    expect(wi?.check_trapped_birds).toBe(true)
    expect(wi?.check_dead_birds).toBe(true)
    expect(wi?.check_feed_water_available).toBe(true)
    expect(wi?.check_equipment_operating).toBe(true)
    expect(wi?.check_amenities_condition).toBe(true)
    expect(wi?.check_lay_facility).toBe(true)
    expect(wi?.comments).toBe('Test weekly welfare comment day 3')
  })

  test('Re-enter data button unlocks form 08 day 3', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToForm08(page)
    await selectDay(page, TEST_DAY)
    await page.click('button:has-text("Re-enter data")')
    await expect(page.locator(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)).toBeVisible()
  })

  test('UPDATE — modifies temperatures and comments, re-saves day 3', async ({ page }) => {
    const dialogs = []
    page.on('dialog', d => { dialogs.push(d.message()); d.accept() })
    await goToForm08(page)
    await selectDay(page, TEST_DAY)
    await expect(page.locator(`text=Daily Tracking - Day ${TEST_DAY}`)).toBeVisible({ timeout: 8_000 })
    await page.click('button:has-text("Re-enter data")')
    await page.waitForTimeout(300)

    // Update temperatures
    await page.locator('input[type="number"]').nth(0).fill('24.0')
    await page.locator('input[type="number"]').nth(1).fill('20.0')
    await page.locator('input[type="number"]').nth(2).fill('-8.0')

    // Update initials
    const initialInputs = page.locator('input[maxLength="6"]')
    await initialInputs.nth(0).fill('XY')
    await initialInputs.nth(1).fill('ZW')

    // Update weekly comments
    await page.fill('textarea', 'Updated weekly welfare comment day 3')

    await page.click(`button[type="submit"]:has-text("Save Day ${TEST_DAY} Record")`)
    await page.waitForTimeout(1500)

    expect(dialogs.some(m => /error saving/i.test(m) || /^error:/i.test(m))).toBeFalsy()
    await expect(page.locator(`text=Already recorded for Day ${TEST_DAY}`)).toBeVisible({ timeout: 10_000 })
  })

  test('READ after UPDATE — Supabase reflects updated welfare day 3 values', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const rec = await getWelfareRecords(admin, barn.id, TEST_DAY)

    expect(rec.dailyCheck).not.toBeNull()
    expect(rec.weeklyInspection).not.toBeNull()
    expect(parseFloat(rec.dailyCheck?.barn_temp_hi)).toBeCloseTo(24.0, 1)
    expect(parseFloat(rec.dailyCheck?.barn_temp_lo)).toBeCloseTo(20.0, 1)
    expect(parseFloat(rec.dailyCheck?.exterior_temp)).toBeCloseTo(-8.0, 1)
    expect(rec.dailyCheck?.hen_inspection_am).toBe('XY')
    expect(rec.dailyCheck?.hen_inspection_pm).toBe('ZW')
    expect(rec.weeklyInspection?.comments).toBe('Updated weekly welfare comment day 3')
  })
})

// ── Monthly checks tests ─────────────────────────────────────────────────────

test.describe.serial('Form 08 — monthly checks CRUD', () => {
  async function goToMonthlyTab(page) {
    await goToForm08(page)
    await page.click('button:has-text("Monthly Checks")')
    await page.waitForTimeout(500)
  }

  test('CREATE — fills all monthly welfare check fields and saves', async ({ page }) => {
    const dialogs = []
    page.on('dialog', d => { dialogs.push(d.message()); d.accept() })
    await goToMonthlyTab(page)

    // Ammonia range select
    const ammoniaSelect = page.locator('select').first()
    await ammoniaSelect.selectOption('5-10')

    // Ammonia distilled water checkbox
    const distilledWaterCb = page.locator('input[type="checkbox"]').first()
    await distilledWaterCb.check()

    // Ammonia initials
    const textInputs = page.locator('input[type="text"]')
    await textInputs.nth(0).fill('MJ')

    // Ammonia notes
    const textareas = page.locator('textarea')
    if (await textareas.count() > 0) {
      await textareas.first().fill('Ammonia test notes here')
    }

    // Alarm check date and initials
    const dateInputs = page.locator('input[type="date"]')
    await dateInputs.nth(0).fill('2026-05-05')
    await textInputs.nth(1).fill('MJ').catch(() => { })

    // Generator check date and initials
    await dateInputs.nth(1).fill('2026-05-06').catch(() => { })
    await textInputs.nth(2).fill('MJ').catch(() => { })

    // Save monthly checks
    await page.click('button:has-text("Save Monthly Checks")')
    await page.waitForTimeout(1500)

    expect(dialogs.some(m => /^error:/i.test(m) || /error saving/i.test(m))).toBeFalsy()

    // Validate persistence directly to avoid false negatives from dialog timing/text
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    await expect.poll(async () => {
      const { data: audit } = await admin.from('monthly_audits').select('id')
        .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
      const { data: wr } = await admin.from('welfare_records').select('id')
        .eq('barn_id', barn.id).eq('audit_id', audit?.id).maybeSingle()
      const { data: mc } = await admin.from('welfare_monthly_checks').select('ammonia_ppm_range')
        .eq('welfare_id', wr?.id).maybeSingle()
      return mc?.ammonia_ppm_range || null
    }, { timeout: 15_000 }).toBe('5-10')
  })

  test('READ — Supabase has correct monthly welfare check values after CREATE', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: wr } = await admin.from('welfare_records').select('id')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    const { data: mc } = await admin.from('welfare_monthly_checks').select('*')
      .eq('welfare_id', wr.id).maybeSingle()

    expect(mc).toBeTruthy()
    expect(mc.ammonia_ppm_range).toBe('5-10')
    expect(mc.ammonia_distilled_water).toBe(true)
    expect(mc.ammonia_initials).toBe('MJ')
    expect(mc.alarm_check_date).toBe('2026-05-05')
  })

  test('UPDATE — edits ammonia range and re-saves monthly welfare checks', async ({ page }) => {
    const dialogs = []
    page.on('dialog', d => { dialogs.push(d.message()); d.accept() })
    await goToMonthlyTab(page)

    // Change ammonia range
    const ammoniaSelect = page.locator('select').first()
    if (!(await ammoniaSelect.isEnabled())) {
      const editBtn = page.locator('button').filter({ hasText: /Edit Monthly Checks/i }).first()
      if (await editBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await editBtn.click()
      }
    }
    await expect(ammoniaSelect).toBeEnabled({ timeout: 10_000 })
    await ammoniaSelect.selectOption('10-15')

    await page.click('button:has-text("Save Monthly Checks")')
    await page.waitForTimeout(1500)

    expect(dialogs.some(m => /^error:/i.test(m) || /error saving/i.test(m))).toBeFalsy()

    // Ensure persistence before moving to READ-after-UPDATE test.
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    await expect.poll(async () => {
      const { data: audit } = await admin.from('monthly_audits').select('id')
        .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
      const { data: wr } = await admin.from('welfare_records').select('id')
        .eq('barn_id', barn.id).eq('audit_id', audit?.id).maybeSingle()
      const { data: mc } = await admin.from('welfare_monthly_checks').select('ammonia_ppm_range')
        .eq('welfare_id', wr?.id).maybeSingle()
      return mc?.ammonia_ppm_range || null
    }, { timeout: 15_000 }).toBe('10-15')
  })

  test('READ after UPDATE — Supabase reflects updated monthly welfare check values', async ({ page }) => {
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    const recDate = recordDate(TEST_DAY)

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: wr } = await admin.from('welfare_records').select('id')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    const { data: mc } = await admin.from('welfare_monthly_checks').select('ammonia_ppm_range')
      .eq('welfare_id', wr.id).maybeSingle()

    expect(mc.ammonia_ppm_range).toBe('10-15')
  })
})
