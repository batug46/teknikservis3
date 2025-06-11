import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Merkezi prisma istemcisini import ediyoruz

/**
 * @description Tüm ürünleri listeler. Bu rota herkese açıktır.
 * GET /api/admin/products
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    return NextResponse.json({ error: 'Ürünler getirilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

// NOT: POST, PUT ve DELETE fonksiyonları admin koruması gerektirir
// ve şu anki middleware yapınızla uyumlu çalışacaktır.
// Onları şimdilik buraya eklemiyorum ki odak noktamız dağılmasın.
// İhtiyaç duyduğumuzda onları da ekleyebiliriz.

