import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // DÜZELTİLMİŞ YOL
import { verifyAuth } from '../../../lib/auth'; // DÜZELTİLMİŞ YOL

export async function PUT(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { name, email, phone } = await request.json();
    
    // Eğer email değiştiriliyorsa, yeni email'in başka bir kullanıcı tarafından
    // kullanılıp kullanılmadığını kontrol et.
    if (email && email !== userPayload.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
        }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.id },
      data: {
        name: name,
        adSoyad: name,
        email: email,
        phone: phone, // Telefonu güncelle
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ 
      message: 'Profil güncellendi.',
      user: userWithoutPassword 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
  }
}
