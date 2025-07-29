import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { id: true, isActive: true }
    });

    if (!product) {
      return NextResponse.json({ isActive: false, error: 'Ürün bulunamadı.' });
    }

    return NextResponse.json({ isActive: product.isActive });
  } catch (error) {
    console.error('Ürün aktiflik kontrolü hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 