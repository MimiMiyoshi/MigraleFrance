import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Supabaseクライアントの初期化
console.log('Initializing Supabase client...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing! Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client initialized successfully');