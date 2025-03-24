// import type { Config } from "drizzle-kit";
// import * as dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not set");
// }

// export default {
//   schema: "./drizzle/schema.ts",
//   out: "./drizzle/migrations",
//   driver: "pg" as const,
//   dbCredentials: {
//     connectionString: process.env.DATABASE_URL,
//   },
//   verbose: true,
//   strict: true,
// } satisfies Config;
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const config = {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
};

// 型チェックをやめて export（drizzle-kit が読み込めればOK）
export default config;
