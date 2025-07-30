import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    let userId = session.user?.id;
    
    // Eğer userId yoksa email ile kullanıcıyı bul
    if (!userId && session.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID bulunamadı' }, { status: 400 });
    }

    const { orderItemId, reason, description, returnType } = await request.json();

    // Validasyon
    if (!orderItemId || !reason) {
      return NextResponse.json({ error: 'Gerekli alanları doldurun' }, { status: 400 });
    }

    // OrderItem'ın kullanıcıya ait olduğunu kontrol et
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: parseInt(orderItemId),
        order: {
          userId: parseInt(userId)
        }
      },
      include: {
        order: true
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Bu ürün için iade talebi oluşturamazsınız' }, { status: 404 });
    }

    // Daha önce iade talebi var mı kontrol et
    const existingReturn = await prisma.return.findFirst({
      where: {
        orderItemId: parseInt(orderItemId),
        userId: parseInt(userId)
      }
    });

    if (existingReturn) {
      return NextResponse.json({ error: 'Bu ürün için zaten iade talebiniz bulunuyor' }, { status: 400 });
    }

    // İade talebini oluştur
    const returnRequest = await prisma.return.create({
      data: {
        orderItemId: parseInt(orderItemId),
        userId: parseInt(userId),
        reason,
        description: description || null,
        returnType: returnType || 'REFUND'
      },
      include: {
        orderItem: {
          include: {
            product: true,
            order: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'İade talebiniz başarıyla oluşturuldu',
      return: returnRequest
    });
  } catch (error) {
    console.error('İade talebi oluşturma hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 