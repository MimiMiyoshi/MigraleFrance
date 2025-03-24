// supabase.ts
import { createClient } from "@supabase/supabase-js";

export const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key must be provided");
  }

  return createClient(supabaseUrl, supabaseKey);
};

// import { createClient } from '@supabase/supabase-js';

// // 環境変数からSupabaseの接続情報を取得
// const supabaseUrl = process.env.SUPABASE_URL as string;
// const supabaseKey = process.env.SUPABASE_KEY as string;

// // Supabaseクライアントの作成
// if (!supabaseUrl || !supabaseKey) {
//   throw new Error('Supabase URL and key must be provided');
// }

// // Supabaseクライアントをエクスポート
// export const supabase = createClient(supabaseUrl, supabaseKey);
