import { createClient } from '@supabase/supabase-js';

import type { Database } from './databaseTypes';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
