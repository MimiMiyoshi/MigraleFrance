import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL または SUPABASE_KEY が設定されていません');
}

export const supabase = createClient(supabaseUrl, supabaseKey);