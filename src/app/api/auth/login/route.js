// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'SENIN_COK_GUCLU_VE_OZEL_ANAHTARIN_BURAYA'; // .env dosyanızdaki ile aynı olduğundan emin olun

/**
 * @description Kullanıcı girişi yapar ve JWT token döndürür.
 * POST /api/auth/login
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gereklidir.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // Token 1 gün geçerli olacak
    );

    // Kullanıcı bilgilerini şifresiz olarak ayıkla (frontend için)
    const { password: _, ...userWithoutPassword } = user;

    // Token'ı HTTP-only cookie olarak ayarla
    const response = NextResponse.json({
      message: 'Giriş başarılı.',
      user: userWithoutPassword, // Kullanıcı bilgisi frontend'e gönderiliyor
    });

    response.cookies.set('token', token, {
      httpOnly: true, // JavaScript erişemez
      secure: process.env.NODE_ENV === 'production', // HTTPS'te çalışır
      maxAge: 60 * 60 * 24, // 1 gün (saniye cinsinden)
      path: '/', // Tüm domain için geçerli
      sameSite: 'lax', // CSRF koruması için
    });

    return response;

  } catch (error) {
    console.error('Giriş yapılırken hata:', error);
    return NextResponse.json({ error: 'Giriş yapılırken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}