/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/next',
  assetPrefix: '/next',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig