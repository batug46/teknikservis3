const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const products = [
    {
      name: 'Kamera Sistemi Kurulum ve Tamiri',
      description: 'Güvenlik kamerası sistemlerinizin kurulumu, bakımı ve profesyonel tamiri.',
      price: 450.00,
      imageUrl: '/product-camera.jpg', // Bu görselleri public klasörünüze eklemeniz gerekecek
      category: 'guvenlik',
      stock: 100, // Servis bazlı olduğu için stok yüksek olabilir
    },
    {
      name: 'Bilgisayar Donanım Tamiri',
      description: 'Masaüstü ve dizüstü bilgisayarlarınız için anakart, ekran kartı ve diğer donanım tamir hizmetleri.',
      price: 300.00,
      imageUrl: '/product-computer.jpg',
      category: 'bilgisayar',
      stock: 100,
    },
    {
      name: 'Akıllı Telefon Ekran Değişimi',
      description: 'Kırık veya arızalı akıllı telefon ekranlarınızın orijinal parçalarla değişimi.',
      price: 250.00,
      imageUrl: '/product-phone.jpg',
      category: 'telefon',
      stock: 100,
    },
  ];

  for (const p of products) {
    // upsert: Eğer bu isimde bir ürün varsa güncellemez, yoksa oluşturur.
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
    console.log(`Created product with id: ${product.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
