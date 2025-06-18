import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
