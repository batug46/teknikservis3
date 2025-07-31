import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { id } = params;
    const { reason, description } = await request.json();

    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
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

    // Siparişi iptal et
    const cancelledOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        cancelDescription: description,
        cancelledAt: new Date()
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Sipariş başarıyla iptal edildi',
      order: cancelledOrder
    });

  } catch (error) {
    console.error('Sipariş iptal hatası:', error);
    return NextResponse.json({ error: 'Sipariş iptal edilirken hata oluştu' }, { status: 500 });
  }
} 