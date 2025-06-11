import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Bu fonksiyon, bir yolun public yollar listesinde olup olmadığını kontrol eder.
// 'startsWith' kullanmak, /products/1 gibi dinamik yolları da kapsar.
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
    '/products', // Ürünler ve ürün detay sayfaları
    '/cart',     // Sepet sayfası
    '/api/auth', // Giriş ve kayıt API'ları
    '/api/products', // Tek bir ürün getiren API
    '/api/admin/products', // Tüm ürünleri listeleyen API
  ];

  // Eğer istenen yol public ise, devam etmesine izin ver.
  if (isPublicPath(pathname, publicPaths)) {
    return NextResponse.next();
  }

  // Korumalı yollar için token kontrolü yap
  const token = request.cookies.get('token')?.value;

  // Eğer token yoksa, giriş sayfasına yönlendir.
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Girişten sonra geri dönebilmesi için
    return NextResponse.redirect(loginUrl);
  }

  // Eğer token varsa, doğruluğunu kontrol et.
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    const { payload } = await jwtVerify(token, secret);

    // Admin rotalarını kontrol et
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      // Admin değilse ana sayfaya yönlendir
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Her şey yolundaysa, isteğin devam etmesine izin ver.
    return NextResponse.next();
  } catch (error) {
    // Token geçersizse (süresi dolmuş vb.), giriş sayfasına yönlendir.
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Middleware'in hangi yollarda çalışacağını belirler.
  // API rotalarını hariç tutan (?!api) bölümü kaldırıldı.
  // Artık middleware, API rotaları dahil olmak üzere statik dosyalar hariç her şeyde çalışacak.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
