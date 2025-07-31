import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../../lib/auth';
import prisma from '../../../../../../../lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { id: orderId, itemId } = params;
    const { reason, description } = await request.json();

    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Kullanıcının kendi siparişi mi kontrol et
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu siparişi iptal etme yetkiniz yok' }, { status: 403 });
    }

    // Sipariş durumunu kontrol et - sadece PENDING ve CONFIRMED durumları iptal edilebilir
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return NextResponse.json({ 
        error: 'Bu sipariş artık iptal edilemez. Sipariş kargolandıktan sonra iade talebi oluşturabilirsiniz.' 
      }, { status: 400 });
    }

    // Ürünü kontrol et
    const orderItem = order.items.find(item => item.id === parseInt(itemId));
    if (!orderItem) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Ürün zaten iptal edilmiş mi kontrol et
    if (orderItem.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Bu ürün zaten iptal edilmiş' }, { status: 400 });
    }

    // Ürünü iptal et
    const cancelledItem = await prisma.orderItem.update({
      where: { id: parseInt(itemId) },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelDescription: description,
        cancelledAt: new Date()
      },
      include: {
        product: true
      }
    });

    // Siparişteki tüm ürünlerin durumunu kontrol et
    const remainingItems = await prisma.orderItem.findMany({
      where: { 
        orderId: parseInt(orderId),
        status: { not: 'CANCELLED' }
      }
    });

    // Eğer tüm ürünler iptal edildiyse siparişi de iptal et
    if (remainingItems.length === 0) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: 'CANCELLED',
          cancelReason: 'Tüm ürünler iptal edildi',
          cancelDescription: 'Kullanıcı tarafından tüm ürünler iptal edildi',
          cancelledAt: new Date()
        }
      });
    }

    return NextResponse.json({
      message: 'Ürün başarıyla iptal edildi',
      item: cancelledItem,
      orderCancelled: remainingItems.length === 0
    });

  } catch (error) {
    console.error('Ürün iptal hatası:', error);
    return NextResponse.json({ error: 'Ürün iptal edilirken hata oluştu' }, { status: 500 });
  }
} 