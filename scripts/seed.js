const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // HİZMETLER (Kategori: 'servis')
  const services = [
    {
      name: 'Kamera Sistemi Kurulum ve Tamiri',
      description: 'Güvenlik kamerası sistemlerinizin kurulumu, bakımı ve profesyonel tamiri.',
      price: 450.00,
      imageUrl: 'https://images.pexels.com/photos/277553/pexels-photo-277553.jpeg',
      category: 'servis', // Kategori 'servis' olarak belirlendi
      stock: 100,
    },
    {
      name: 'Bilgisayar Donanım Tamiri',
      description: 'Masaüstü ve dizüstü bilgisayarlarınız için anakart, ekran kartı ve diğer donanım tamir hizmetleri.',
      price: 300.00,
      imageUrl: 'https://images.pexels.com/photos/4005596/pexels-photo-4005596.jpeg',
      category: 'servis',
      stock: 100,
    },
    {
      name: 'Akıllı Telefon Ekran Değişimi',
      description: 'Kırık veya arızalı akıllı telefon ekranlarınızın orijinal parçalarla değişimi.',
      price: 250.00,
      imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      category: 'servis',
      stock: 100,
    },
  ];

  // SATILABİLİR ÜRÜNLER (Kategori: 'urun')
  const physicalProducts = [
    {
        name: 'XYZ Oyuncu Laptop',
        description: 'En yeni nesil işlemci ve ekran kartı ile yüksek performans.',
        price: 32500.00,
        imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        category: 'urun', // Kategori 'urun' olarak belirlendi
        stock: 15,
    },
    {
        name: 'ABC 4K Güvenlik Kamerası',
        description: 'Gece görüşlü, hareket sensörlü 4K çözünürlüklü güvenlik kamerası.',
        price: 1850.00,
        imageUrl: 'https://images.pexels.com/photos/224959/pexels-photo-224959.jpeg',
        category: 'urun',
        stock: 40,
    },
    {
        name: 'ProModel Akıllı Telefon',
        description: 'Yüksek çözünürlüklü kamera ve uzun pil ömrüne sahip son model akıllı telefon.',
        price: 25000.00,
        imageUrl: 'https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg',
        category: 'urun',
        stock: 25,
    },
  ];

  // Tüm ürünleri birleştir
  const allProducts = [...services, ...physicalProducts];

  for (const p of allProducts) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
    console.log(`Updated or created product: ${p.name}`);
  }

  console.log('Seeding finished.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
