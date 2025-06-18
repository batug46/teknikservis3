import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const productId = parseInt(params.id);

    const ratings = await prisma.orderItem.findMany({
      where: {
        productId: productId,
        rating: { not: null },
      },
      select: {
        rating: true,
      },
    });

    if (ratings.length === 0) {
      return NextResponse.json({ average: 0, count: 0 });
    }

    const totalRating = ratings.reduce((sum, item) => sum + (item.rating || 0), 0);
    const average = totalRating / ratings.length;

    return NextResponse.json({ average, count: ratings.length });

  } catch (error) {
    return NextResponse.json({ error: 'Puanlar alınamadı.' }, { status: 500 });
  }
}
