// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Bu fonksiyon, bir yolun public yollar listesinde olup olmadığını kontrol eder.
const isPublicPath = (pathname, publicPaths) => {
  return publicPaths.some(path => pathname.startsWith(path));
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Herkesin erişebileceği sayfaların ve API'ların listesi
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/contact',
    '/products',
    '/cart',
    '/book-appointment', // Randevu alma sayfası
    '/api/auth', // Giriş ve kayıt API'ları (örn. /api/auth/login, /api/auth/register, /api/auth/create-admin)
    '/api/products', // Ürün API'ları
    // Admin API'ları public değildir, çünkü middleware tarafından korunur.
    // Ancak login page içinde api/auth/login'e yapılan istek public olmalı.
  ];

  // Eğer istenen yol public ise, devam etmesine izin ver.
  // Not: Eğer bir path listeye eklenirse, o path'in altındaki tüm alt path'ler de public olur.
  // Örneğin, '/api/auth' eklendiğinde '/api/auth/login', '/api/auth/register' da public olur.
  if (isPublicPath(pathname, publicPaths)) {
    return NextResponse.next();
  }

  // Korumalı yollar için token kontrolü yap
  // Token'ı HTTP-only çerezden alıyoruz
  const token = request.cookies.get('token')?.value;

  // Eğer token yoksa, giriş sayfasına yönlendir.
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url); // Admin paneli için admin login'e yönlendir
    loginUrl.searchParams.set('redirect', pathname); // Girişten sonra geri dönebilmesi için
    return NextResponse.redirect(loginUrl);
  }

  // Eğer token varsa, doğruluğunu kontrol et.
  try {
    // JWT_SECRET'ın .env dosyasından doğru geldiğinden emin olun!
    // JOSE kütüphanesi için secret'ı TextEncoder ile encode etmeliyiz.
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'SENIN_COK_GUCLU_VE_OZEL_ANAHTARIN_BURAYA');
    const { payload } = await jwtVerify(token, secret);

    // Admin rotalarını kontrol et (/admin ile başlayan her yol)
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      // Admin değilse ana sayfaya yönlendir
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Her şey yolundaysa, isteğin devam etmesine izin ver.
    return NextResponse.next();
  } catch (error) {
    // Token geçersizse (süresi dolmuş vb.), giriş sayfasına yönlendir.
    console.error("Middleware token doğrulama hatası:", error);
    const loginUrl = new URL('/admin/login', request.url); // Token hatasında admin login'e yönlendir
    loginUrl.searchParams.set('redirect', pathname);
    
    // Geçersiz token çerezini temizleyelim
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  // Middleware'in hangi yollarda çalışacağını belirler.
  // Statik dosyaları (.ico, _next/static, _next/image) hariç tutar.
  // Diğer tüm yollarda (API rotaları dahil) çalışır.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};