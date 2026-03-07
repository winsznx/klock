import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@pulseprotocol/sdk', '@pulseprotocol/react', '@reown/appkit', '@reown/appkit-adapter-wagmi', '@reown/appkit-adapter-bitcoin', 'wagmi', 'viem'],
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    }
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/shims/async-storage.ts'),
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  output: 'standalone',
};

export default nextConfig;
