import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseKey);