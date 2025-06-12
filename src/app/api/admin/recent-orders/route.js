// Dosya Yolu: src/app/api/admin/recent-orders/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Siparişler alınamadı." }, { status: 500 });
  }
}