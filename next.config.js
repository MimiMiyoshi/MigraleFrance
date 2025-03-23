/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 既存のクライアントサイドコードを使用するための設定
  transpilePackages: [],
  experimental: {
    esmExternals: "loose",
  },
  // API Routes用の設定
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
  // 環境変数の設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // ビルド設定
  output: "standalone",
  // TypeScriptの厳密なチェックを有効化
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
