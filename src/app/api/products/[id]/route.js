import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Geçersiz ürün IDsi.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API /api/products/[id] Error:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}