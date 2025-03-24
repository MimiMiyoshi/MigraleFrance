const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.join(__dirname, "src"),
      "@components": path.join(__dirname, "src/components"),
      "@lib": path.join(__dirname, "src/lib"),
      "@utils": path.join(__dirname, "src/utils"),
      "@shared": path.join(__dirname, "src/shared"),
      "@hooks": path.join(__dirname, "src/hooks"),
    };
    return config;
  },
};

module.exports = nextConfig;
