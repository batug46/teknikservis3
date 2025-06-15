import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// PUT: Belirtilen ID'ye sahip ürünü günceller
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { name, description, price, imageUrl, category, stock } = data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category,
        stock: parseInt(stock),
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
  }
}

// DELETE: Belirtilen ID'ye sahip ürünü siler
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error("API DELETE Error:", error);
    return NextResponse.json({ error: 'Silme işlemi başarısız.' }, { status: 500 });
  }
}