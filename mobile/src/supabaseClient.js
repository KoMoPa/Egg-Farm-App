import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xjojuicgwtpdfnwidget.supabase.co'
const supabaseAnonKey = 'sb_publishable_e9Xi0TEMrlg2eZB6QYzlVQ_M3JU7B-n'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
