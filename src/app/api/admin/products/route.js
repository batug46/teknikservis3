import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET: Tüm ürünleri listeler
export async function GET(request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST: Yeni bir ürün veya hizmet oluşturur
export async function POST(request) {
  try {
    const data = await request.json();
    const { name, description, price, imageUrl, category, stock } = data;

    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: 'İsim, fiyat ve kategori zorunludur.' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category,
        stock: parseInt(stock) || 0,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: 'Ürün oluşturulamadı.' }, { status: 500 });
  }
}
