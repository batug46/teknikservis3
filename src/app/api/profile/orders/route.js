import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    
    const orders = await prisma.order.findMany({
      where: { userId: userPayload.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: {
            id: true,
            rating: true,
            product: { select: { name: true } }
          }
        }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Siparişler getirilemedi.' }, { status: 500 });
  }
}