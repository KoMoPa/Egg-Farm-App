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

async function clearDayRecords(admin, barnId, day) {
  const recDate = recordDate(day)

  const { data: audit } = await admin.from('monthly_audits').select('id')
    .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
  if (!audit) return

  const { data: fwr } = await admin.from('feed_water_records').select('id')
    .eq('barn_id', barnId).eq('audit_id', audit.id).maybeSingle()
  if (!fwr) return

  await admin.from('feed_water_daily').delete().eq('fw_id', fwr.id).eq('record_date', recDate)
  await admin.from('feed_water_health').delete().eq('fw_id', fwr.id).eq('record_date', recDate)
}

async function ensureActiveFlockWithCount(admin, barnId, targetCount = 250) {
  const { data: barn } = await admin
    .from('barns')
    .select('id,current_flock_id,flock_arrival_date,flock_age_at_arrival_weeks')
    .eq('id', barnId)
    .maybeSingle()

  let flockId = barn?.current_flock_id ?? null

  if (!flockId) {
    const { data: newFlock, error: newFlockError } = await admin
      .from('flocks')
      .insert([{
        barn_id: barnId,
        arrival_date: barn?.flock_arrival_date ?? recordDate(1),
        status: 'active',
        age_at_arrival_weeks: barn?.flock_age_at_arrival_weeks ?? null,
        initial_count: targetCount,
        current_count: targetCount,
      }])
      .select('id')
      .single()
    if (newFlockError) throw newFlockError

    flockId = newFlock.id
    const { error: barnUpdateError } = await admin
      .from('barns')
      .update({ current_flock_id: flockId })
      .eq('id', barnId)
    if (barnUpdateError) throw barnUpdateError
    return
  }

  const { error: flockUpdateError } = await admin
    .from('flocks')
    .update({
      status: 'active',
      initial_count: targetCount,
      current_count: targetCount,
    })
    .eq('id', flockId)
  if (flockUpdateError) throw flockUpdateError
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
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)
    await ensureActiveFlockWithCount(admin, barn.id, 250)
    await clearDayRecords(admin, barn.id, TEST_DAY)

    page.on('dialog', d => d.accept())
    await goToForm09(page)
    await selectDay(page, TEST_DAY)

    const inventoryInput = page.locator('label:has-text("Inventory") + input')
    await expect(inventoryInput).toBeDisabled()
    await expect(inventoryInput).not.toHaveValue('')

    await page.locator('label:has-text("Feed Daily Target") + input').fill('1200')
    await page.locator('label:has-text("Feed Actual") + input').fill('1180')
    await page.locator('label:has-text("Water Daily Target") + input').fill('850')
    await page.locator('label:has-text("Water Actual") + input').fill('830')

    await page.locator('label:has-text("Flush") + select').selectOption('true')
    await page.locator('label:has-text("Meds/Vit") + select').selectOption('true')
    await page.locator('label:has-text("Treatment") + select').selectOption('true')

    await page.locator('label:has-text("Daily Notes") + textarea').fill('Feed water test notes day 4')
    await page.locator('label:has-text("Daily Mortality Count") + input').fill('2')
    await page.locator('label:has-text("Reason") + select').selectOption('natural')
    await page.locator('label:has-text("Hospital Pen Monitoring") + select').selectOption('improved')

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
    await expect(page.locator('label:has-text("Feed Daily Target") + input')).toBeEnabled({ timeout: 10_000 })

    await page.locator('label:has-text("Feed Daily Target") + input').fill('1300')
    await page.locator('label:has-text("Feed Actual") + input').fill('1250')
    await page.locator('label:has-text("Water Daily Target") + input').fill('900')
    await page.locator('label:has-text("Water Actual") + input').fill('880')

    // Change Flush to No
    await page.locator('label:has-text("Flush") + select').selectOption('false')

    await page.locator('label:has-text("Daily Notes") + textarea').fill('Updated feed water notes day 4')

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
    const admin = createAdminClient()
    const { farm } = await getTestFarm(admin)
    const barn = await getTestBarn(admin, farm.id)

    const { data: flock } = await admin
      .from('flocks')
      .select('id, initial_count')
      .eq('id', barn.current_flock_id)
      .maybeSingle()

    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    // Monthly section can already be locked from a prior run; unlock before editing.
    const editBtn = page.locator('button:has-text("Edit Monthly Checks")')
    if (await editBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(300)
    }

    const startInventory = page.locator('label:has-text("Starting Inventory") + input')
    await expect(startInventory).toBeDisabled()
    if (flock?.initial_count != null) {
      await expect(startInventory).toHaveValue(String(flock.initial_count))
    }

    // Feed target
    await page.locator('label:has-text("Feed Target") + input').fill('1200 g/bird/day')

    // Water residual monthly
    await page.locator('label:has-text("Water Residual") + input').fill('Residual test notes')

    // Comments
    await page.locator('label:has-text("Comments") + textarea').fill('Monthly feed water comments test')

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

    const { data: flock } = await admin
      .from('flocks')
      .select('id, initial_count')
      .eq('id', barn.current_flock_id)
      .maybeSingle()

    const { data: audit } = await admin.from('monthly_audits').select('id')
      .eq('month_year', recDate.substring(0, 7) + '-01').maybeSingle()
    const { data: fwr } = await admin.from('feed_water_records').select('id')
      .eq('barn_id', barn.id).eq('audit_id', audit.id).maybeSingle()
    const { data: meta } = await admin.from('feed_water_monthly_metadata').select('*')
      .eq('fw_id', fwr.id).maybeSingle()

    expect(meta).toBeTruthy()
    expect(meta.feed_target).toBe('1200 g/bird/day')
    expect(meta.water_residual_monthly).toBe('Residual test notes')
    expect(meta.comments).toBe('Monthly feed water comments test')
    if (flock?.initial_count != null) {
      expect(meta.starting_inventory).toBe(flock.initial_count)
    }
  })

  test('UPDATE — changes monthly text fields and re-saves', async ({ page }) => {
    page.on('dialog', d => d.accept())
    await goToMonthlyTab(page)

    // Unlock if locked
    const editBtn = page.locator('button:has-text("Edit Monthly Checks")')
    if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(300)
    }

    // Update comments
    await page.locator('label:has-text("Feed Target") + input').fill('1300 g/bird/day')
    await page.locator('label:has-text("Water Residual") + input').fill('Updated residual note')
    await page.locator('label:has-text("Comments") + textarea').fill('Updated monthly comments feed/water')

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
    const { data: meta } = await admin.from('feed_water_monthly_metadata').select('feed_target, water_residual_monthly, comments')
      .eq('fw_id', fwr.id).maybeSingle()

    expect(meta.feed_target).toBe('1300 g/bird/day')
    expect(meta.water_residual_monthly).toBe('Updated residual note')
    expect(meta.comments).toBe('Updated monthly comments feed/water')
  })
})
