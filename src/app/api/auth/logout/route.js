import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Çıkış başarılı" });
  
  // 'token' çerezini geçersiz kılmak için maxAge'i 0 yaparak sil.
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}