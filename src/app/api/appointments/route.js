import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth'; // Kimlik doğrulama yardımcımız

export async function POST(request) {
  try {
    const userPayload = await verifyAuth(request);

    // Eğer kullanıcı giriş yapmamışsa, yetkisiz hatası döndür.
    if (!userPayload) {
      return NextResponse.json({ error: 'Bu işlemi yapmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const body = await request.json();
    const { serviceType, description, date, time } = body;

    if (!serviceType || !description || !date || !time) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        userId: userPayload.id, // Giriş yapmış kullanıcının ID'si
        serviceType,
        description,
        date: new Date(date), // Tarihi Date objesine çevir
        time,
        status: 'pending', // Varsayılan durum
      },
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    return NextResponse.json({ error: 'Randevu oluşturulurken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}