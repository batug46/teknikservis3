import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  try {
    // Sadece adminlerin bu API'ye erişebildiğinden emin oluyoruz (middleware'de de kontrol ediliyor ama burada da yapmak iyi bir pratiktir)
    const userPayload = await verifyAuth(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // Siparişi veren kullanıcının adını da getirmek için
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Admin siparişleri getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}