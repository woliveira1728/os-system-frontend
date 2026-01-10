const nextConfig = {
  reactStrictMode: true,
  compiler: { emotion: true },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3333', pathname: '/uploads/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;