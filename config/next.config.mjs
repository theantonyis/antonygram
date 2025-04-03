/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        middlewarePrefetch: "force", // Ensures middleware runs as early as possible
    },
};

export default nextConfig;
