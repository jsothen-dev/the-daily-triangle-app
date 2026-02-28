import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.bjjee.com' },
      { protocol: 'https', hostname: '**.flograppling.com' },
      { protocol: 'https', hostname: '**.flosports.tv' },
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
      { protocol: 'https', hostname: '**.wp.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.jitsmagazine.com' },
      { protocol: 'https', hostname: 'jitsmagazine.com' },
      { protocol: 'https', hostname: '**.graciemag.com' },
      { protocol: 'https', hostname: 'www.graciemag.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.podbean.com' },
      { protocol: 'https', hostname: 'pbcdn1.podbean.com' },
    ],
  },
}

export default nextConfig
