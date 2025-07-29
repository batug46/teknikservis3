import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Mevcut PUT metodu...
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { status } = await request.json();
    
    // Status'u güncelle
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { 
            name: true,
            email: true 
          },
        },
      },
    });

    // Randevuya fiyat bilgisini ekle
    const serviceProduct = await prisma.product.findFirst({
      where: {
        name: updatedAppointment.serviceType,
        category: 'hizmet',
      },
      select: {
        price: true,
      },
    });

    const appointmentWithPrice = {
      ...updatedAppointment,
      price: serviceProduct?.price || 0,
    };

    return NextResponse.json(appointmentWithPrice);
  } catch (error) {
    console.error('Randevu güncelleme hatası:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

// YENİ EKlenen DELETE metodu
export async function DELETE(request, { params }) {
    try {
        const id = parseInt(params.id);
        await prisma.appointment.delete({
            where: { id },
        });
        return NextResponse.json({ message: 'Randevu başarıyla silindi' });
    } catch (error) {
        console.error('Randevu silme hatası:', error);
        return NextResponse.json({ error: 'Randevu silinemedi' }, { status: 500 });
    }
}
