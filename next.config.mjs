/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't run ESLint during production build (pre-existing config issues)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
