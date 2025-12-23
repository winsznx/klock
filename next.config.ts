import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@reown/appkit', '@reown/appkit-adapter-wagmi', '@reown/appkit-adapter-bitcoin', 'wagmi', 'viem'],
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
};

export default nextConfig;
