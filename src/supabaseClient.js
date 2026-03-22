import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xjojuicgwtpdfnwidget.supabase.co'
const supabaseAnonKey = 'sb_publishable_e9Xi0TEMrlg2eZB6QYzlVQ_M3JU7B-n'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
