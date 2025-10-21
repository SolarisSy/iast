/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  
  // Configuração para Docker
  output: 'standalone',
  
  // Configuração de porta personalizada
  env: {
    PORT: process.env.PORT || '3001',
  },
  
  // Permitir imagens de qualquer origem (se necessário)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
