// src/app/admin/(protected)/layout.tsx
'use client';

import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false); // Client-side hydration için
  const [userRole, setUserRole] = useState(null); // Kullanıcı rolünü tutmak için

  useEffect(() => {
    setIsClient(true);
    // Token artık HTTP-only cookie'de olduğu için burada direkt kontrol etmiyoruz.
    // Middleware zaten yetkilendirme kontrolünü yapacak.
    // Sadece user bilgisini localStorage'dan alıyoruz.
    const user = localStorage.getItem('user');

    if (!user) {
      // Eğer user bilgisi yoksa, giriş sayfasına yönlendir (token yoksa middleware yönlendirecektir)
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== 'admin') {
        router.push('/'); // Admin olmayanları ana sayfaya yönlendir
        return;
      }
      setUserRole(parsedUser.role); // Rolü state'e kaydet
    } catch (e) {
      console.error("Kullanıcı bilgisi çözümlenemedi:", e);
      router.push('/admin/login');
      return;
    }
  }, [router]);

  if (!isClient || userRole === null) {
    // Client tarafı render olana ve rol kontrolü bitene kadar boş bir şey döndür
    return null;
  }

  const handleLogout = async () => {
    // Token HTTP-only cookie'de olduğu için, çıkış yaparken sunucuya bir istek göndererek çerezi temizlememiz gerekir.
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Yeni bir logout API endpoint'i oluşturacağız
    } catch (error) {
      console.error('Logout API hatası:', error);
    }
    localStorage.removeItem('user'); // Sadece user bilgisini kaldır
    router.push('/admin/login');
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* === ADMİN SIDEBAR === */}
        <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse vh-100">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin">
                  <i className="bi bi-house-door me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/products">
                  <i className="bi bi-box me-2"></i>
                  Ürünler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/orders">
                  <i className="bi bi-cart me-2"></i>
                  Siparişler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/users">
                  <i className="bi bi-people me-2"></i>
                  Kullanıcılar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/appointments">
                  <i className="bi bi-calendar-check me-2"></i>
                  Randevular
                </Link>
              </li>
            </ul>
            <hr className="my-3 border-top border-secondary" />
            <ul className="nav flex-column mb-2">
              <li className="nav-item">
                <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Çıkış Yap
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* === ANA İÇERİK === */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}