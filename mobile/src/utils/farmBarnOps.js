import { supabase } from '../supabaseClient'

export async function getOrCreateUserFarm(userId, farmName = 'My Farm') {
  const { data: existingFarm, error: fetchError } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingFarm) return { farm: existingFarm, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newFarm, error: createError } = await supabase
    .from('farms')
    .insert([{ user_id: userId, farm_name: farmName, owner_email: '' }])
    .select()
    .single()

  if (createError) throw createError
  return { farm: newFarm, created: true }
}

export async function getFarmBarns(farmId) {
  const { data, error } = await supabase
    .from('barns')
    .select('*')
    .eq('farm_id', farmId)
    .order('barn_number', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createBarn(farmId, barnName, barnNumber) {
  const { data, error } = await supabase
    .from('barns')
    .insert([{ farm_id: farmId, barn_name: barnName, barn_number: barnNumber }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getOrCreateMonthlyAudit(farmId, monthYear) {
  const monthDateObj = new Date(monthYear)
  const monthYearFormatted = monthDateObj.toISOString().split('T')[0]

  const { data: existing, error: fetchError } = await supabase
    .from('monthly_audits')
    .select('*')
    .eq('farm_id', farmId)
    .eq('month_year', monthYearFormatted)
    .single()

  if (existing) return { audit: existing, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newAudit, error: createError } = await supabase
    .from('monthly_audits')
    .insert([{ farm_id: farmId, month_year: monthYearFormatted }])
    .select()
    .single()

  if (createError) throw createError
  return { audit: newAudit, created: true }
}

export async function getOrCreateProductionRecord(farmId, auditId) {
  const { data: existing, error: fetchError } = await supabase
    .from('production_cooler_records')
    .select('*')
    .eq('farm_id', farmId)
    .eq('audit_id', auditId)
    .single()

  if (existing) return { record: existing, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newRecord, error: createError } = await supabase
    .from('production_cooler_records')
    .insert([{ farm_id: farmId, audit_id: auditId }])
    .select()
    .single()

  if (createError) throw createError
  return { record: newRecord, created: true }
}

export async function getOrCreateWelfareRecord(barnId, auditId) {
  const { data: existing, error: fetchError } = await supabase
    .from('welfare_records')
    .select('*')
    .eq('barn_id', barnId)
    .eq('audit_id', auditId)
    .single()

  if (existing) return { record: existing, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newRecord, error: createError } = await supabase
    .from('welfare_records')
    .insert([{ barn_id: barnId, audit_id: auditId }])
    .select()
    .single()

  if (createError) throw createError
  return { record: newRecord, created: true }
}

export async function getOrCreateFeedWaterRecord(farmId, auditId) {
  const { data: existing, error: fetchError } = await supabase
    .from('feed_water_records')
    .select('*')
    .eq('farm_id', farmId)
    .eq('audit_id', auditId)
    .single()

  if (existing) return { record: existing, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newRecord, error: createError } = await supabase
    .from('feed_water_records')
    .insert([{ farm_id: farmId, audit_id: auditId }])
    .select()
    .single()

  if (createError) throw createError
  return { record: newRecord, created: true }
}

export async function getOrCreatePestControlRecord(farmId, auditId) {
  const { data: existing, error: fetchError } = await supabase
    .from('pest_control_records')
    .select('*')
    .eq('farm_id', farmId)
    .eq('audit_id', auditId)
    .single()

  if (existing) return { record: existing, created: false }

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

  const { data: newRecord, error: createError } = await supabase
    .from('pest_control_records')
    .insert([{ farm_id: farmId, audit_id: auditId }])
    .select()
    .single()

  if (createError) throw createError
  return { record: newRecord, created: true }
}
