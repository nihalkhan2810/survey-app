import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds  
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
  env: {
    // Make these available to the browser
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
