import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Yardımcı Fonksiyon: Token'ı doğrulayan ve admin yetkisini kontrol eden fonksiyon
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Yetkilendirme token\'ı bulunamadı veya formatı yanlış.', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Token içerisindeki kullanıcının rolü admin mi diye kontrol et
    if (decoded.role !== 'admin') {
      return { error: 'Yetkisiz erişim. Sadece adminler bu işlemi yapabilir.', status: 403 };
    }

    // Yetki varsa, decoded token bilgisini döndür
    return { user: decoded };
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return { error: 'Geçersiz veya süresi dolmuş token.', status: 401 };
    }
    console.error("Token doğrulama hatası:", err);
    return { error: 'Sunucu hatası.', status: 500 };
  }
}

/**
 * @description Tüm siparişleri getirir (Sadece adminler için).
 * GET /api/admin/orders
 */
export async function GET(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', // En yeni siparişler üstte olsun
      },
      include: {
        // Frontend'de müşteri bilgilerini göstermek için user ilişkisini dahil et
        user: {
          select: {
            name: true,
            email: true,
            adSoyad: true,
          },
        },
        // ÖNEMLİ: Frontend kodunuzda `order.items` kullanılıyor.
        // Bu ilişkinin çalışması için `OrderItem` adında bir modeliniz olmalı.
        // items: {
        //   include: {
        //     product: true,
        //   },
        // },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Siparişler getirilirken hata:', error);
    return NextResponse.json({ error: 'Siparişler getirilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir siparişin durumunu günceller (Sadece adminler için).
 * PUT /api/admin/orders
 */
export async function PUT(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Sipariş ID ve yeni durum bilgisi gereklidir.' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Sipariş durumu güncellenirken hata:', error);
    return NextResponse.json({ error: 'Sipariş durumu güncellenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir siparişi siler (Sadece adminler için).
 * DELETE /api/admin/orders?id=<siparis_id>
 */
export async function DELETE(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Silinecek siparişin ID bilgisi gereklidir.' }, { status: 400 });
    }
    
    // ÖNEMLİ: Eğer siparişe bağlı `OrderItem`'lar varsa,
    // önce onları silmeniz gerekebilir (cascade delete ayarlanmadıysa).
    // await prisma.orderItem.deleteMany({ where: { orderId: parseInt(id) } });

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Sipariş başarıyla silindi.' });
  } catch (error) {
    console.error('Sipariş silinirken hata:', error);
    return NextResponse.json({ error: 'Sipariş silinirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}
