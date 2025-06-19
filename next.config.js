/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', '3.133.91.18'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  env: {
    // Make these available to the browser
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  // Enable standalone output for better AWS deployment
  output: 'standalone',
  // Optimize for AWS deployment
  outputFileTracingRoot: __dirname,
  // Add experimental features for better production support
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '3.133.91.18', '*.amazonaws.com'],
    },
  },
};

module.exports = nextConfig; 