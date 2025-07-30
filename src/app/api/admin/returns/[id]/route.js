import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    // Admin kontrolü
    if (session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id } = params;
    const { 
      status, 
      adminNotes, 
      courierCompany, 
      trackingNumber, 
      shippingAddress, 
      shippingCost, 
      shippingInstructions 
    } = await request.json();

    // Güncelleme verilerini hazırla
    const updateData = {
      status: status,
      adminNotes: adminNotes || null
    };

    // Kargo bilgilerini ekle (eğer varsa)
    if (courierCompany !== undefined) updateData.courierCompany = courierCompany || null;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress || null;
    if (shippingCost !== undefined) {
      updateData.shippingCost = shippingCost !== null && shippingCost !== '' ? parseFloat(shippingCost) : null;
    }
    if (shippingInstructions !== undefined) updateData.shippingInstructions = shippingInstructions || null;

    // Durum değişikliklerine göre tarih güncellemeleri
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'RECEIVED') {
      updateData.receivedAt = new Date();
    }

    // İade talebini güncelle
    const updatedReturn = await prisma.return.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
      include: {
        orderItem: {
          include: {
            product: true,
            order: true
          }
        },
        user: {
          select: {
            id: true,
            adSoyad: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'İade talebi durumu güncellendi',
      return: updatedReturn
    });
  } catch (error) {
    console.error('İade talebi güncelleme hatası:', error);
    console.error('Hata detayları:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json({ 
      error: 'Bir hata oluştu', 
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
} 