/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placeholder.co', 'jumboargentina.vtexassets.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

module.exports = nextConfig
