import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 400 });
    }

    // Token'ı kontrol et
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!passwordReset) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş token' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Token geçerli' });

  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token ve şifre gerekli' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Token'ı kontrol et
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!passwordReset) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş token' }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: passwordReset.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Yeni şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 12);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Kullanılan token'ı sil
    await prisma.passwordReset.delete({
      where: { id: passwordReset.id }
    });

    return NextResponse.json({ message: 'Şifre başarıyla güncellendi' });

  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 