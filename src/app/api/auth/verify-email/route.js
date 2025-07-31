import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { sendVerificationEmail } from '../../../../lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email zaten doğrulanmış' }, { status: 400 });
    }

    // Doğrulama tokeni oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // Tokeni veritabanına kaydet
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry
      }
    });

    // Email gönder
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Email gönderilemedi' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Doğrulama emaili gönderildi',
      email: email 
    });

  } catch (error) {
    console.error('Email doğrulama hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 400 });
    }

    // Tokeni kontrol et
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.json({ error: 'Token süresi dolmuş' }, { status: 400 });
    }

    // Kullanıcıyı güncelle
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: true }
    });

    // Tokeni sil
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ 
      message: 'Email başarıyla doğrulandı',
      success: true 
    });

  } catch (error) {
    console.error('Email doğrulama hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 