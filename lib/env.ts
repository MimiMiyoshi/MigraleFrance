import { z } from "zod";

// 環境変数のスキーマ定義
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Supabase URLが無効です"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase Anon Keyが設定されていません"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase Service Role Keyが設定されていません"),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NextAuth URLが無効です"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NextAuth Secretは32文字以上である必要があります"),

  // Database
  DATABASE_URL: z.string().min(1, "Database URLが設定されていません"),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, "Session Secretは32文字以上である必要があります"),

  // Application
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// 環境変数の型
export type Env = z.infer<typeof envSchema>;

// 環境変数のバリデーション関数
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      console.error("環境変数のバリデーションエラー:");
      console.error(issues.join("\n"));
      throw new Error("環境変数の設定が不正です");
    }
    throw error;
  }
}

// 環境変数のバリデーション結果
export const env = validateEnv();
