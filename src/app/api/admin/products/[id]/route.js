import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// PUT: Belirtilen ID'ye sahip ürünü günceller
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { name, description, price, originalPrice, imageUrl, category, stock, isActive, specifications, images, soldCount, viewCount } = data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        imageUrl,
        category,
        stock: parseInt(stock),
        isActive: isActive !== undefined ? isActive : true,
        specifications: specifications || {},
        images: images || [],
        soldCount: soldCount ? parseInt(soldCount) : undefined,
        viewCount: viewCount ? parseInt(viewCount) : undefined,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("API PUT Error:", error);
    return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
  }
}

// PATCH: Belirtilen ID'ye sahip ürünün isActive durumunu günceller
export async function PATCH(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const { isActive } = data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        isActive: isActive,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("API PATCH Error:", error);
    return NextResponse.json({ error: 'Durum güncelleme başarısız.' }, { status: 500 });
  }
}

// DELETE: Belirtilen ID'ye sahip ürünü siler
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    // Önce ürünün ilişkili kayıtlarını kontrol et
    const productWithRelations = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        likedBy: true,
        reviews: true
      }
    });

    if (!productWithRelations) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    console.log('Silinecek ürün ilişkileri:', {
      orderItems: productWithRelations.orderItems.length,
      likedBy: productWithRelations.likedBy.length,
      reviews: productWithRelations.reviews.length
    });

    // İlişkili kayıtları sil
    await prisma.$transaction([
      // İade taleplerini sil
      prisma.return.deleteMany({
        where: {
          orderItem: {
            productId: id
          }
        }
      }),
      // Beğenilen ürünleri sil
      prisma.likedProduct.deleteMany({
        where: { productId: id }
      }),
      // Ürün yorumlarını sil
      prisma.productReview.deleteMany({
        where: { productId: id }
      }),
      // Sipariş kalemlerini sil
      prisma.orderItem.deleteMany({
        where: { productId: id }
      }),
      // Ürünü sil
      prisma.product.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error("API DELETE Error:", error);
    console.error("Hata detayları:", {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ 
      error: 'Silme işlemi başarısız.', 
      details: error.message 
    }, { status: 500 });
  }
}