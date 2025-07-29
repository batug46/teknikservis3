const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Tohumlama başlıyor...');

  // --- 1. Admin Kullanıcısını Oluştur ---
  const adminEmail = 'admin@teknikservis.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      adSoyad: 'Sistem Yöneticisi',
      role: 'admin',
    },
  });
  console.log(`Admin kullanıcısı oluşturuldu/güncellendi: ${adminUser.email}`);
  
  // --- 2. Ana Sayfa Hizmetlerini Ekle ---
  const homeServices = [
    {
      title: 'Bilgisayar Tamiri',
      description: 'Donanım ve yazılım sorunlarınıza hızlı, garantili ve güvenilir çözümler sunuyoruz.',
      imageUrl: 'https://images.pexels.com/photos/4005596/pexels-photo-4005596.jpeg',
      linkUrl: '/products?category=bilgisayar-tamiri',
      order: 1,
      isActive: true
    },
    {
      title: 'Telefon Tamiri',
      description: 'Ekran değişimi, batarya sorunları ve diğer tüm marka model telefon tamir işlemleri.',
      imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      linkUrl: '/products?category=telefon-tamiri',
      order: 2,
      isActive: true
    },
    {
      title: 'Güvenlik Sistemleri',
      description: 'Kamera ve alarm sistemleri kurulumu ile ev ve iş yerinizi güvence altına alıyoruz.',
      imageUrl: 'https://images.pexels.com/photos/277553/pexels-photo-277553.jpeg',
      linkUrl: '/products?category=guvenlik-sistemleri',
      order: 3,
      isActive: true
    }
  ];

  for (const service of homeServices) {
    await prisma.service.upsert({
      where: { title: service.title },
      update: service,
      create: service,
    });
    console.log(`Hizmet oluşturuldu/güncellendi: ${service.title}`);
  }

  // --- 1. Mevcut Ürünleri Ekle ---
  const products = [
    {
      name: 'ABC 4K Güvenlik Kamerası',
      description: 'Gece görüşlü, hareket sensörlü 4K çözünürlük ile yüksek kaliteli güvenlik kamerası.',
      price: 1850.00,
      imageUrl: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
      category: 'urun',
      stock: 39,
      isActive: true,
    },
    {
      name: 'ProModel Akıllı Telefon',
      description: 'Yüksek çözünürlüklü kamera ve uzun pil ömrü ile premium akıllı telefon.',
      price: 25000.00,
      imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      category: 'urun',
      stock: 24,
      isActive: true,
    },
    {
      name: 'XYZ Oyuncu Laptop',
      description: 'En yeni nesil işlemci ve ekran kartı ile yüksek performanslı oyuncu laptop.',
      price: 32500.00,
      imageUrl: 'https://images.pexels.com/photos/4005596/pexels-photo-4005596.jpeg',
      category: 'urun',
      stock: 14,
      isActive: true,
    },
  ];

  // --- 2. Mevcut Hizmetleri Ekle ---
  const services = [
    {
      name: 'Kamera Sistemi Kurulum ve Tamiri',
      description: 'Güvenlik kamerası sistemlerinizin kurulumu, bakımı ve profesyonel tamiri.',
      price: 450.00,
      imageUrl: 'https://images.pexels.com/photos/277553/pexels-photo-277553.jpeg',
      category: 'hizmet',
      stock: 0,
      isActive: true,
    },
    {
      name: 'Bilgisayar Donanım Tamiri',
      description: 'Masaüstü ve dizüstü bilgisayarlarınız için anakart, ekran kartı ve diğer donanım tamir hizmetleri.',
      price: 300.00,
      imageUrl: 'https://images.pexels.com/photos/4005596/pexels-photo-4005596.jpeg',
      category: 'hizmet',
      stock: 0,
      isActive: true,
    },
    {
      name: 'Akıllı Telefon Ekran Değişimi',
      description: 'Kırık veya arızalı akıllı telefon ekranlarınızın orijinal parçalarla değişimi.',
      price: 250.00,
      imageUrl: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
      category: 'hizmet',
      stock: 0,
      isActive: true,
    },
  ];
  const allProducts = [...services, ...products];

  for (const p of allProducts) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
    console.log(`Ürün oluşturuldu/güncellendi: ${p.name}`);
  }

  console.log('Tohumlama tamamlandı.');
}

main()
  .catch((e) => {
    console.error('Tohumlama sırasında bir hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
