'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    // Bu fonksiyon, localStorage'dan veriyi okuyup state'i günceller.
    const handleAuthStateChange = () => {
      try {
        const storedUser = localStorage.getItem('user');
        setUser(storedUser ? JSON.parse(storedUser) : null);

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);
      } catch (error) {
        console.error("Veri okunurken hata:", error);
        setUser(null);
        setCartCount(0);
      }
    };
    
    // Sayfa ilk yüklendiğinde ve diğer sekmelerde bir değişiklik olduğunda çalışır.
    window.addEventListener('storage', handleAuthStateChange);
    // Giriş/Çıkış gibi olaylardan sonra tetiklenecek özel event'imizi dinler.
    window.addEventListener('authChange', handleAuthStateChange);

    // Bileşen ilk yüklendiğinde durumu kontrol et.
    handleAuthStateChange();

    // Listener'ları temizle
    return () => {
      window.removeEventListener('storage', handleAuthStateChange);
      window.removeEventListener('authChange', handleAuthStateChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    fetch('/api/auth/logout', { method: 'POST' });
    
    // Çıkış yapıldığında authChange event'ini tetikle, böylece navbar anında güncellenir.
    window.dispatchEvent(new Event('authChange'));
    
    router.push('/');
  };

  if (!isMounted) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link href="/" className="navbar-brand">
            Teknik Servis
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link href="/" className="navbar-brand">
          Teknik Servis
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/products" className="nav-link">
                Ürünler
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/book-appointment" className="nav-link">
                Randevu Al
              </Link>
            </li>
             <li className="nav-item">
              <Link href="/contact" className="nav-link">
                İletişim
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/cart" className="nav-link">
                <i className="bi bi-cart me-1"></i>
                Sepet ({cartCount})
              </Link>
            </li>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link href="/admin" className="nav-link fw-bold text-danger">
                      Admin Paneli
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link href="/messages" className="nav-link">
                    Mesajlarım
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/profile" className="nav-link">
                    Profilim
                  </Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="nav-link btn btn-link">
                    Çıkış Yap
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link href="/login" className="nav-link">
                    Giriş Yap
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/register" className="nav-link">
                    Kayıt Ol
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}