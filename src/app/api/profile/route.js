import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });

    const { name, email, phone, address, currentPassword, newPassword } = await request.json();
    
    const updateData = { name, adSoyad: name, email, phone, address };

    if (email && email !== userPayload.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
          return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
      }
    }

    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({ where: { id: userPayload.id } });
      if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) return NextResponse.json({ error: 'Mevcut şifreniz yanlış.' }, { status: 400 });
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userPayload.id },
      data: updateData,
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json({ message: 'Profil güncellendi.', user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız.' }, { status: 500 });
  }
}
