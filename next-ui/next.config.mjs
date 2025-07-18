import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Image settings — unoptimized keeps the bundle light (adjust as needed)
    images: {
      unoptimized: true,
      domains: ['localhost'], // remove or extend if you load external images
    },
  
    // Ignore ESLint during builds for deterministic builds
    eslint: { ignoreDuringBuilds: true },
  
    // Make selected server env vars available on the client
    env: {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
  
    // Development tweaks — Turbopack is still unstable for many setups
    experimental: {
      // turbo: false,
      optimizeCss: true, // Optimize CSS loading
    },
  
    // Disable browser source-maps in production to shrink the slug
    // Note: CSS module source maps still appear in dev mode - use "Hide network" in DevTools to clean console
    productionBrowserSourceMaps: false,

    // Optimize CSS loading to reduce preload warnings
    compress: true,
  
    // Custom webpack tweaks
    webpack: (config, { webpack, dev }) => {
      if (dev) {
        // Improve file-watcher reliability on WSL/Docker
        config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
        
        // Optional: Disable CSS source maps in development too
        // config.devtool = 'eval'; // Uncomment if you want to disable CSS source maps in dev
      }
  
      // Drop all moment.js locale bundles (~280 kB)
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
  
      return config;
    },

    // API proxy configuration
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/:path*",
        },
      ];
    },
  };
  
  const withPWAConfig = withPWA({
    dest: 'public',
    disable: isDev,
    register: true,
    skipWaiting: true,
    cacheId: 'angushally-v2', // 🔄 Bumped from v1 to v2
    buildExcludes: [
      /app-build-manifest\.json$/,
      /_middleware\.js$/,
      /_middleware\.ts$/,
    ],
  })
  
  export default withPWAConfig(nextConfig)
  