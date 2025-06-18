/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bu bölüm, dışarıdan resim çekmemize izin verir
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // DÜZELTİLMİŞ BÖLÜM:
      // Pexels'den gelen resimler için doğru hostname'i ekliyoruz.
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      // Başka bir siteden resim eklemek isterseniz,
      // o sitenin resim alan adını buraya ekleyebilirsiniz.
    ],
  },
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
