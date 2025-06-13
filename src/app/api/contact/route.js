import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // DÜZELTİLMİŞ YOL

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Tüm zorunlu alanlar doldurulmalıdır.' }, { status: 400 });
    }
    
    await prisma.message.create({
      data: {
        name,
        email,
        message,
        status: 'unread',
      },
    });

    return NextResponse.json({ message: 'Mesaj başarıyla oluşturuldu' }, { status: 201 });
  } catch (error) {
    console.error("İletişim formu API hatası:", error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
