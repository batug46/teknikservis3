import { NextResponse } from 'next/server';
import { verifyAuth } from './lib/auth'; // Yeni doğrulayıcıyı import et

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const userPayload = await verifyAuth(request);

  // Admin giriş sayfasını koruma döngüsünden çıkar
  if (pathname.startsWith('/admin/login')) {
    // Eğer zaten giriş yapmış bir adminse, onu dashboard'a yönlendir
    if (userPayload && userPayload.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin sayfalarını koru
  if (pathname.startsWith('/admin')) {
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Profil sayfasını koru
  if (pathname.startsWith('/profile')) {
    if (!userPayload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};