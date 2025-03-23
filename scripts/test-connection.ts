import { supabase, db } from "../lib/supabase";
import dotenv from "dotenv";
import { sql } from "drizzle-orm";

// .env.localファイルを読み込む
dotenv.config({ path: ".env.local" });

async function testConnection() {
  console.log("🔍 接続テストを開始します...");

  try {
    // Supabase接続テスト
    console.log("\n1️⃣ Supabaseとの接続をテスト中...");
    const { data, error: supabaseError } = await supabase.auth.getSession();
    console.log("✅ Supabase接続成功！");

    // データベース接続テスト
    console.log("\n2️⃣ データベース接続をテスト中...");
    const result = await db.execute(
      sql`SELECT current_timestamp, current_database(), version();`
    );
    console.log("✅ データベース接続成功！");
    console.log(`📊 データベース情報:`);
    console.log(`   - 現在のタイムスタンプ: ${result[0].current_timestamp}`);
    console.log(`   - データベース名: ${result[0].current_database}`);
    console.log(`   - PostgreSQLバージョン: ${result[0].version}`);

    console.log("\n🎉 すべての接続テストが成功しました！");
  } catch (error) {
    console.error("\n❌ エラーが発生しました:");
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testConnection();
