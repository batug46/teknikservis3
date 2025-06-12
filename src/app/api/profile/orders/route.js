import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Düzeltilmiş import yolu
import { verifyAuth } from '../../../../lib/auth'; // Düzeltilmiş import yolu

export async function GET(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: userPayload.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("API Hatası - /api/profile/orders:", error);
    return NextResponse.json({ error: 'Siparişler getirilemedi.' }, { status: 500 });
  }
}