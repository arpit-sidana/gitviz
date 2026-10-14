import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/gitviz' : '',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
