import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or key is missing. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);