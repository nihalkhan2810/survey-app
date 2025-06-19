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
    domains: ['localhost'],
  },
  env: {
    // Make these available to the browser
    NEXT_PUBLIC_APP_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig; 