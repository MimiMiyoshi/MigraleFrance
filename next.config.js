/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 既存のクライアントサイドコードを使用するための設定
  transpilePackages: [],
  experimental: {
    esmExternals: 'loose',
  },
  // API Routes用の設定
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;