/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config, { isServer }) {
        // Desativa a minimização apenas para o cliente
        if (isServer) {
          config.optimization.minimize = false;
        }
        return config;
    }
  };

export default nextConfig;
