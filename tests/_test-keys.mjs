import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.test' })

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('URL:', url)
console.log('Anon key (first 40 chars):', anonKey?.slice(0, 40))
console.log('Service key (first 20 chars):', serviceKey?.slice(0, 20))

// Test admin operations
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false }})
const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 3 })
console.log('Admin listUsers:', listErr ? 'ERROR: ' + listErr.message : `OK (${listData.users.length} users listed)`)

// Test signIn with anon key using a non-existent email (expect "Invalid login credentials" if key is valid)
const anon = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false }})
const { data, error: signInErr } = await anon.auth.signInWithPassword({ email: 'probe-test@nonexistent.invalid', password: 'badpass123' })
if (signInErr) {
  console.log('Anon signIn error:', signInErr.message)
  console.log('  → "Invalid login credentials" = key is VALID, user doesnt exist')
  console.log('  → "Invalid API key" = key is WRONG/UNSUPPORTED')
} else {
  console.log('Anon signIn: OK (unexpected)')
}
