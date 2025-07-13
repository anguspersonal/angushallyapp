import webpack from 'webpack';
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure all routes end with a slash (optional but helpful for trailing consistency)
    trailingSlash: true,
  
    // Image settings — unoptimized is fine for now (e.g. no image loader required)
    images: {
      unoptimized: true,
      domains: ['localhost'], // remove if you're not using external images
    },
  
    // Expose server env vars to the client
    env: {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
  
    // Development tweaks — Turbopack disabled due to stability issues
    experimental: {
      // turbo: false, // Disabled due to stability issues
    },
  
    // Production optimizations
    productionBrowserSourceMaps: false,
  
    // Optional: polling for stable dev experience (especially on WSL or Docker)
    webpack: (config, { dev }) => {
      if (dev) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      
      // Ignore moment.js locales to reduce bundle size
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ })
      );
      
      return config;
    },
  };
  
  export default nextConfig;
  