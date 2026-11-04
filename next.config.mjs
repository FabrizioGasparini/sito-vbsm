/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'volleyballsanmartino.it',
                port: '',
                pathname: '/images/**',
            },
        ],
        qualities: [30, 40, 50, 60, 70, 80, 90, 100],
        formats: ["image/avif", "image/webp"]
    },
};

export default nextConfig;
