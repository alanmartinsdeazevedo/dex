/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatar-management--avatars.us-west-2.prod.public.atl-paas.net',
        port: '',
      }
    ]
  },
    webpack(config, { isServer }) {
        // Desativa a minimização apenas para o cliente
        if (isServer) {
          config.optimization.minimize = false;
        }
        return config;
    }
  };

export default nextConfig;
