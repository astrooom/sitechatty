/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // domains: ['utfs.io'],
    remotePatterns: [
      {
          protocol: 'https',
          hostname: '**',
          port: '',
          pathname: '**',
      },
  ],
  }
};

module.exports = nextConfig;
