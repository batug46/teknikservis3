import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // CORS headers ekle
    const response = NextResponse.next();
    const origin = req.headers.get('origin');
    
    if (origin) {
      const allowedOrigins = [
        'http://localhost:3000',
        process.env.NEXTAUTH_URL || 'https://your-domain.vercel.app'
      ];
      
      if (allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      }
    }

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

    return response;
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
    secret: process.env.NEXTAUTH_SECRET,
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/messages/:path*'],
};