import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Mevcut PUT metodu...
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { status } = await request.json();
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updatedAppointment);
  } catch (error) {
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
