// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // Use false for 307 Temporary Redirect, similar to your middleware
      },
    ];
  },
};

export default nextConfig;
