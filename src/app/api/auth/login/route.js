import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';

// JWT secret should be at least 32 bytes long for HS256
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-that-is-at-least-32-characters'
);

export async function POST(request) {
  try {
    // İstek gövdesini kontrol et
    const body = await request.json();
    console.log('Gelen istek:', body);

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        adSoyad: true
      }
    });

    console.log('Bulunan kullanıcı:', { ...user, password: '***' });

    if (!user) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Şifre doğru mu:', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
    }

    // Token oluştur
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(JWT_SECRET);

    const { password: _, ...userWithoutPassword } = user;
    
    // Cookie ayarla
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 gün
    });

    return NextResponse.json({
      message: 'Giriş başarılı!',
      user: userWithoutPassword,
    });

  } catch (error) {
    // Hata detaylarını logla
    console.error('Login hatası:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json({ 
      error: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}
