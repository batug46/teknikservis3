import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { authOptions } from './lib/auth';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin giriş sayfasını kontrol et
    if (pathname.startsWith('/admin/login')) {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    // Admin sayfalarını koru
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Profile sayfası için yetkilendirme
        if (pathname.startsWith('/profile') || pathname.startsWith('/messages')) {
          return !!token;
        }

        // Admin sayfaları için yetkilendirme
        if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
          return token?.role === 'admin';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/messages/:path*'],
};