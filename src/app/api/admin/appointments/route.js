import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { 
            name: true,
            email: true 
          },
        },
      },
    });

    // Randevulardaki tüm hizmet isimlerini (serviceType) topla.
    const serviceTypes = appointments.map(appt => appt.serviceType);

    // Veritabanından bu hizmetlere karşılık gelen ürünleri tek seferde bul.
    const serviceProducts = await prisma.product.findMany({
      where: {
        name: { in: serviceTypes },
        category: 'hizmet',
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

    const response = NextResponse.json(appointmentsWithPrice);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '-1');
    return response;
  } catch (error) {
    console.error("Admin appointments API error:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}