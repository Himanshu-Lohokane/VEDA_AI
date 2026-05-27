/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suppress service worker 404 errors
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/404',
      },
    ];
  },
}

module.exports = nextConfig
