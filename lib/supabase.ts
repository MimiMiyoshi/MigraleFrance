import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../drizzle/schema";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

// Supabaseクライアントの作成
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// PostgreSQLクライアントの作成
const queryClient = postgres(process.env.DATABASE_URL!);

// Drizzle ORMの初期化
export const db = drizzle(queryClient, { schema });

// マイグレーション関数
export async function runMigrations() {
  if (process.env.NODE_ENV === "development") {
    try {
      await migrate(db, { migrationsFolder: "./drizzle/migrations" });
      console.log("✅ マイグレーションが正常に完了しました");
    } catch (error) {
      console.error("❌ マイグレーションエラー:", error);
      throw error;
    }
  }
}
