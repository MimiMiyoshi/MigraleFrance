import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase環境変数が設定されていません。データベース機能は機能しない可能性があります。');
}

export const supabase = createClient(supabaseUrl, supabaseKey);