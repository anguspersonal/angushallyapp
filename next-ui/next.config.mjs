/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static image imports
    images: {
        domains: ['localhost'],
    },
    // Expose environment variables to the client
    env: {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    },
    // Proxy API requests to Express backend during development
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*', // Proxy to Express backend
            },
        ];
    },
    // Webpack configuration for better stability
    webpack: (config, { dev, isServer }) => {
        if (dev) {
            // Improve development build stability
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            };
        }
        return config;
    },
};

export default nextConfig; 