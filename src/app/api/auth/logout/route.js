// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

/**
 * @description Kullanıcının oturumunu kapatır ve token çerezini siler.
 * POST /api/auth/logout
 */
export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Çıkış başarılı.' });

    // Token çerezini sil
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Çerezi hemen sona erdir
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Çıkış yapılırken hata:', error);
    return NextResponse.json({ error: 'Çıkış yapılırken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}