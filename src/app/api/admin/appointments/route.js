import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    // Randevulardaki tüm hizmet isimlerini (serviceType) topla.
    const serviceTypes = appointments.map(appt => appt.serviceType);

    // Veritabanından bu hizmetlere karşılık gelen ürünleri tek seferde bul.
    const serviceProducts = await prisma.product.findMany({
      where: {
        name: { in: serviceTypes },
        category: 'servis',
      },
      select: {
        name: true,
        price: true,
      },
    });

    // Hızlı arama için hizmet adı ve fiyatını eşleştiren bir harita oluştur.
    const priceMap = new Map(serviceProducts.map(p => [p.name, p.price]));

    // Her randevuya, haritadan bulduğu fiyat bilgisini ekle.
    const appointmentsWithPrice = appointments.map(appt => ({
      ...appt,
      price: priceMap.get(appt.serviceType) || 0, // Eğer fiyat bulunamazsa 0 olarak ayarla.
    }));

    return NextResponse.json(appointmentsWithPrice);
  } catch (error) {
    console.error("Admin appointments API error:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}