import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

/**
 * @description Kullanıcı girişi yapar ve JWT token oluşturur.
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

    // 3. Kullanıcı yoksa veya şifre yanlışsa, genel bir hata mesajı ver.
    // Bu, "kullanıcı adı geçerli ama şifre yanlış" gibi ipuçları vermemek için bir güvenlik önlemidir.
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 } // 401 Unauthorized
      );
    }

    // 4. Veritabanındaki hash'lenmiş şifre ile kullanıcının girdiği şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
       return NextResponse.json(
        { error: 'Geçersiz e-posta veya şifre.' },
        { status: 401 }
      );
    }

    // 5. Şifre doğruysa, JWT (JSON Web Token) oluştur
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // Bu rol bilgisi, admin API'larını korumak için çok önemli!
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token 1 gün geçerli olsun
    );

    // 6. Cevap olarak göndermeden önce kullanıcı nesnesinden şifreyi kaldır
    const { password: _, ...userWithoutPassword } = user;

    // 7. Başarılı cevabı, token ve kullanıcı bilgileriyle birlikte gönder
    return NextResponse.json({
      message: 'Giriş başarılı!',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Giriş API Hatası:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
