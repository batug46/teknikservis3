const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Örnek ürünler
        const products = [
            {
                name: 'Kamera Sistemi Kurulum ve Tamiri',
                description: 'Profesyonel kamera sistemi kurulum ve tamir hizmetleri',
                price: 1500,
                category: 'servis',
                imageUrl: 'https://placehold.co/600x400?text=Kamera+Sistemi',
            },
            {
                name: 'Bilgisayar Donanım Tamiri',
                description: 'Her türlü bilgisayar donanım sorununun çözümü',
                price: 500,
                category: 'servis',
                imageUrl: 'https://placehold.co/600x400?text=Bilgisayar+Tamiri',
            },
            {
                name: 'Akıllı Telefon Ekran Değişimi',
                description: 'Orijinal parçalarla ekran değişim hizmeti',
                price: 800,
                category: 'servis',
                imageUrl: 'https://placehold.co/600x400?text=Ekran+Degisimi',
            },
        ];

        for (const product of products) {
            await prisma.product.upsert({
                where: { name: product.name },
                update: {},
                create: product,
            });
        }

        console.log('Örnek ürünler eklendi');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
