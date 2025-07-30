import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 6;

    // Mevcut ürünü getir
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        category: true,
        price: true,
        name: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Benzer ürünleri getir (aynı kategori, benzer fiyat aralığı)
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: parseInt(id) },
        category: currentProduct.category,
        isActive: true,
        stock: { gt: 0 },
        price: {
          gte: currentProduct.price * 0.7, // %30 daha düşük
          lte: currentProduct.price * 1.3, // %30 daha yüksek
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        stock: true,
        category: true,
      },
      take: limit,
      orderBy: [
        { category: 'asc' },
        { price: 'asc' },
      ],
    });

    // Eğer yeterli benzer ürün yoksa, aynı kategoriden daha fazla ürün getir
    if (similarProducts.length < limit) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          id: { not: parseInt(id) },
          category: currentProduct.category,
          isActive: true,
          stock: { gt: 0 },
          id: { notIn: similarProducts.map(p => p.id) },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          stock: true,
          category: true,
        },
        take: limit - similarProducts.length,
        orderBy: { price: 'asc' },
      });

      similarProducts.push(...additionalProducts);
    }

    // Eğer hala yeterli ürün yoksa, diğer kategorilerden popüler ürünler getir
    if (similarProducts.length < limit) {
      const popularProducts = await prisma.product.findMany({
        where: {
          id: { not: parseInt(id) },
          isActive: true,
          stock: { gt: 0 },
          id: { notIn: similarProducts.map(p => p.id) },
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          stock: true,
          category: true,
        },
        take: limit - similarProducts.length,
        orderBy: { createdAt: 'desc' },
      });

      similarProducts.push(...popularProducts);
    }

    return NextResponse.json({
      similarProducts,
      total: similarProducts.length,
    });
  } catch (error) {
    console.error('Benzer ürünler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Benzer ürünler getirilemedi' },
      { status: 500 }
    );
  }
} 