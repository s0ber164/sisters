/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.squarespace-cdn.com',
      'images.unsplash.com',
      'via.placeholder.com'
    ],
  },
}

module.exports = nextConfig
