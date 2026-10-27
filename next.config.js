/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  eslint: {
    // We will do explicit linting checks during test phase
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We will do explicit tsc checks
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
