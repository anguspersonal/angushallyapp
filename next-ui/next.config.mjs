/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure all routes end with a slash (helps with trailing-slash consistency)
    trailingSlash: true,
  
    // Image settings — unoptimized keeps the bundle light (adjust as needed)
    images: {
      unoptimized: true,
      domains: ['localhost'], // remove or extend if you load external images
    },
  
    // Make selected server env vars available on the client
    env: {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
  
    // Development tweaks — Turbopack is still unstable for many setups
    experimental: {
      // turbo: false,
    },
  
    // Disable browser source-maps in production to shrink the slug
    productionBrowserSourceMaps: false,
  
    // Custom webpack tweaks
    webpack: (config, { webpack, dev }) => {
      if (dev) {
        // Improve file-watcher reliability on WSL/Docker
        config.watchOptions = { poll: 1000, aggregateTimeout: 300 };
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
  };
  
  export default nextConfig;
  