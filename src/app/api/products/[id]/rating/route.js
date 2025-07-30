import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Geçersiz ürün IDsi.' }, { status: 400 });
    }

    // Ürünün var olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    // Ürünle ilgili puanları getir (yeni ProductReview modelini kullan)
    const ratings = await prisma.productReview.findMany({
      where: {
        productId: productId,
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

    return NextResponse.json({ 
      average: parseFloat(average.toFixed(1)), 
      count: ratings.length 
    });

  } catch (error) {
    console.error("Products rating API error:", error);
    return NextResponse.json({ error: 'Puanlar alınamadı.' }, { status: 500 });
  }
} 