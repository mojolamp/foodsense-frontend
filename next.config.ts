import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Performance Optimizations
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      '@heroicons/react',
      '@headlessui/react',
      'lucide-react',
      'date-fns',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate recharts (large charting library)
            recharts: {
              test: /[\\/]node_modules[\\/](recharts|d3-.*|victory.*)[\\/]/,
              name: 'recharts',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate react-query
            reactQuery: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
              name: 'react-query',
              priority: 15,
              reuseExistingChunk: true,
            },
            // Common shared components
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              name: 'common',
            },
          },
        },
      };
    }

    return config;
  },

  // Reduce bundle size by stripping console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // ESLint and TypeScript checking
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
