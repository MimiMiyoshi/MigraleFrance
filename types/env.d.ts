declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // NextAuth
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    // Database
    DATABASE_URL: string;

    // Session
    SESSION_SECRET: string;

    // Application
    NODE_ENV: "development" | "production" | "test";
  }
}
