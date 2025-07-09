/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable static image imports
    images: {
        domains: ['localhost'],
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
};

export default nextConfig; 