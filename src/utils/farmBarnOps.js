import { supabase } from '../supabaseClient'

/**
 * Get or create the user's farm
 * Since the schema has a 1:1 relationship (user_id -> farm), 
 * we create one if it doesn't exist
 */
export async function getOrCreateUserFarm(userId, farmName = 'My Farm', ownerEmail = '') {
  try {
    // Try to get existing farm
    const { data: existingFarm, error: fetchError } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingFarm) {
      // Backfill owner_email if it's missing
      if (ownerEmail && !existingFarm.owner_email) {
        const { data: updatedFarm, error: updateError } = await supabase
          .from('farms')
          .update({ owner_email: ownerEmail })
          .eq('id', existingFarm.id)
          .select()
          .single()
        if (!updateError) return { farm: updatedFarm, created: false }
      }
      return { farm: existingFarm, created: false }
    }

    // Farm doesn't exist, create it

    const { data: newFarm, error: createError } = await supabase
      .from('farms')
      .insert([{
        user_id: userId,
        farm_name: farmName,
        owner_email: ownerEmail
      }])
      .select()
      .single()

    if (createError) throw createError
    return { farm: newFarm, created: true }
  } catch (err) {
    console.error('Error getting/creating farm:', err)
    throw err
  }
}

/**
 * Get all barns for a farm
 */
export async function getFarmBarns(farmId) {
  try {
    const { data: barns, error } = await supabase
      .from('barns')
      .select('*')
      .eq('farm_id', farmId)
      .order('barn_name', { ascending: true })

    if (error) throw error
    return barns || []
  } catch (err) {
    console.error('Error fetching barns:', err)
    throw err
  }
}

/**
 * Create a new barn
 */
export async function createBarn(farmId, barnName, options = {}) {
  try {
    const { data: newBarn, error } = await supabase
      .from('barns')
      .insert([{
        farm_id: farmId,
        barn_name: barnName,
        has_floor_eggs: options.has_floor_eggs ?? false,
        two_collections_per_day: options.two_collections_per_day ?? false,
        has_bedding: options.has_bedding ?? false,
        has_chemicals: options.has_chemicals ?? false,
        housing_type: options.housing_type ?? null,
        feed_method: options.feed_method ?? null,
      }])
      .select()
      .single()

    if (error) throw error
    return newBarn
  } catch (err) {
    console.error('Error creating barn:', err)
    throw err
  }
}

/**
 * Get or create monthly audit record for a barn
 */
export async function getOrCreateMonthlyAudit(farmId, monthYear) {
  try {
    // Normalize to "YYYY-MM-DD" — monthYear may arrive as "YYYY-MM-01" from
    // the app context or as "YYYY-MM-DD" from Supabase; substring(0, 10) is safe
    // for both and avoids any UTC-offset issues from new Date() parsing.
    const monthYearFormatted = monthYear.substring(0, 10)

    // Try to get existing audit
    const { data: existingAudit, error: fetchError } = await supabase
      .from('monthly_audits')
      .select('*')
      .eq('farm_id', farmId)
      .eq('month_year', monthYearFormatted)
      .single()

    if (existingAudit) {
      return { audit: existingAudit, created: false }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    // Create new audit
    const { data: newAudit, error: createError } = await supabase
      .from('monthly_audits')
      .insert([{
        farm_id: farmId,
        month_year: monthYearFormatted
      }])
      .select()
      .single()

    if (createError) throw createError
    return { audit: newAudit, created: true }
  } catch (err) {
    console.error('Error getting/creating monthly audit:', err)
    throw err
  }
}

/**
 * Get or create production cooler records parent
 */
export async function getOrCreateProductionRecord(barnId, auditId, flockId) {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('production_cooler_records')
      .select('*')
      .eq('barn_id', barnId)
      .eq('audit_id', auditId)
      .single()

    if (existingRecord) {
      return { record: existingRecord, created: false }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const { data: newRecord, error: createError } = await supabase
      .from('production_cooler_records')
      .insert([{
        barn_id: barnId,
        audit_id: auditId,
        flock_id: flockId
      }])
      .select()
      .single()

    if (createError) throw createError
    return { record: newRecord, created: true }
  } catch (err) {
    console.error('Error getting/creating production record:', err)
    throw err
  }
}

/**
 * Get or create welfare records parent
 */
export async function getOrCreateWelfareRecord(barnId, auditId, flockId) {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('welfare_records')
      .select('*')
      .eq('barn_id', barnId)
      .eq('audit_id', auditId)
      .single()

    if (existingRecord) {
      return { record: existingRecord, created: false }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const { data: newRecord, error: createError } = await supabase
      .from('welfare_records')
      .insert([{
        barn_id: barnId,
        audit_id: auditId,
        flock_id: flockId
      }])
      .select()
      .single()

    if (createError) throw createError
    return { record: newRecord, created: true }
  } catch (err) {
    console.error('Error getting/creating welfare record:', err)
    throw err
  }
}

/**
 * Get or create feed/water records parent
 */
export async function getOrCreateFeedWaterRecord(barnId, auditId, flockId) {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('feed_water_records')
      .select('*')
      .eq('barn_id', barnId)
      .eq('audit_id', auditId)
      .single()

    if (existingRecord) {
      return { record: existingRecord, created: false }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const { data: newRecord, error: createError } = await supabase
      .from('feed_water_records')
      .insert([{
        barn_id: barnId,
        audit_id: auditId,
        flock_id: flockId
      }])
      .select()
      .single()

    if (createError) throw createError
    return { record: newRecord, created: true }
  } catch (err) {
    console.error('Error getting/creating feed/water record:', err)
    throw err
  }
}

/**
 * Get or create pest control records parent
 */
export async function getOrCreatePestControlRecord(barnId, auditId, flockId) {
  try {
    const { data: existingRecord, error: fetchError } = await supabase
      .from('pest_control_records')
      .select('*')
      .eq('barn_id', barnId)
      .eq('audit_id', auditId)
      .single()

    if (existingRecord) {
      return { record: existingRecord, created: false }
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const { data: newRecord, error: createError } = await supabase
      .from('pest_control_records')
      .insert([{
        barn_id: barnId,
        audit_id: auditId,
        flock_id: flockId
      }])
      .select()
      .single()

    if (createError) throw createError
    return { record: newRecord, created: true }
  } catch (err) {
    console.error('Error getting/creating pest control record:', err)
    throw err
  }
}

/**
 * Get current active flock for a barn
 */
export async function getCurrentFlockForBarn(barnId) {
  try {
    const { data: barn, error } = await supabase
      .from('barns')
      .select('current_flock_id')
      .eq('id', barnId)
      .single()

    if (error) throw error
    return { flockId: barn?.current_flock_id }
  } catch (err) {
    console.error('Error getting current flock for barn:', err)
    throw err
  }
}

/**
 * Close current active flock (set depletion_date and status='closed')
 */
export async function closeCurrentFlock(flockId) {
  try {
    if (!flockId) return { success: true }
    const { error } = await supabase
      .from('flocks')
      .update({
        depletion_date: new Date().toISOString().split('T')[0],
        status: 'closed'
      })
      .eq('id', flockId)
    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('Error closing flock:', err)
    throw err
  }
}

/**
 * Create a new active flock for a barn (status='active', arrival_date=today)
 */
export async function createNewFlock(barnId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data: newFlock, error } = await supabase
      .from('flocks')
      .insert([{
        barn_id: barnId,
        arrival_date: today,
        status: 'active'
      }])
      .select()
      .single()
    if (error) throw error
    return { flock: newFlock }
  } catch (err) {
    console.error('Error creating new flock:', err)
    throw err
  }
}

/**
 * Update barn's current_flock_id reference
 */
export async function updateBarnCurrentFlockId(barnId, flockId) {
  try {
    const { error } = await supabase
      .from('barns')
      .update({ current_flock_id: flockId })
      .eq('id', barnId)
    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('Error updating barn current flock:', err)
    throw err
  }
}
