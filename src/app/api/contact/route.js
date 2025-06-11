import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @description İletişim formundan yeni bir mesaj oluşturur.
 * POST /api/contact
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message, subject } = body; // 'subject' de formda vardı, onu da ekleyelim.

    // 1. Gelen veriyi doğrula
    if (!name || !email || !message || !subject) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }

    // 2. Prisma kullanarak mesajı veritabanına kaydet
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        message,
        // subject alanı schema'da yok, ama eklemek iyi olabilir. 
        // Şimdilik schema'daki alanları kullanıyoruz.
        // subject: subject,
      },
    });

    // 3. Başarılı olduğuna dair bir cevap döndür
    return NextResponse.json(
      { 
        message: 'Mesajınız başarıyla gönderildi!',
        data: newMessage 
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('İletişim Formu API Hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
