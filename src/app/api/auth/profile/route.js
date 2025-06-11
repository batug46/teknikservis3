import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

/**
 * @description Kullanıcı girişi yapar ve JWT token'ı bir HTTPOnly cookie olarak ayarlar.
 * POST /api/auth/login
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Gelen veriyi kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre alanları zorunludur.' },
        { status: 400 }
      );
    }

    // 2. Kullanıcıyı veritabanında e-posta ile bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Kullanıcı yoksa veya şifre yanlışsa hata ver
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      );
    }

    // 4. Şifre doğruysa, JWT (JSON Web Token) oluştur
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token 1 gün geçerli
    );

    // 5. Cevap olarak göndermeden önce kullanıcı nesnesinden şifreyi kaldır
    const { password: _, ...userWithoutPassword } = user;
    
    // 6. JSON cevabını oluştur
    const response = NextResponse.json({
      message: 'Giriş başarılı!',
      user: userWithoutPassword,
    });

    // 7. Token'ı güvenli bir HTTP-Only çerez olarak ayarla
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true, // Çerezin sadece sunucu tarafından okunmasını sağlar, JavaScript erişemez.
      secure: process.env.NODE_ENV === 'production', // Sadece HTTPS üzerinde gönderilir.
      path: '/', // Sitenin tamamında geçerli olur.
      maxAge: 60 * 60 * 24, // 1 gün (saniye cinsinden)
    });

    return response;

  } catch (error) {
    console.error('Giriş API Hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
