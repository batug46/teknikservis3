const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const adminEmail = 'admin@teknikservis.com';
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Admin',
                adSoyad: 'Admin User',
                role: 'admin',
            },
        });

        console.log('Admin kullanıcısı oluşturuldu:', admin);
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 