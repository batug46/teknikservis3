import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../../lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email adresi gerekli' }, { status: 400 });
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı döndür
      return NextResponse.json({ 
        message: 'Şifre sıfırlama linki email adresinize gönderildi.' 
      });
    }

    // Önceki reset token'larını temizle
    await prisma.passwordReset.deleteMany({
      where: { email: email.toLowerCase() }
    });

    // Yeni reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // Token'ı veritabanına kaydet
    await prisma.passwordReset.create({
      data: {
        email: email.toLowerCase(),
        token: resetToken,
        expiresAt: resetTokenExpiry
      }
    });

    // Email gönderimi (opsiyonel - hata durumunda işlem devam eder)
    try {
      if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
        await sendPasswordResetEmail(email, resetToken);
      }
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Email hatası işlemi etkilemez
    }

    return NextResponse.json({ 
      message: 'Şifre sıfırlama linki email adresinize gönderildi.' 
    });

  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json({ 
      error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
    }, { status: 500 });
  }
} 