'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    
    const handleStateChange = () => {
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
    
    window.addEventListener('storage', handleStateChange);
    window.addEventListener('authChange', handleStateChange);

    handleStateChange();

    return () => {
      window.removeEventListener('storage', handleStateChange);
      window.removeEventListener('authChange', handleStateChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    fetch('/api/auth/logout', { method: 'POST' });
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
              // KULLANICI GİRİŞ YAPMIŞSA:
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {user.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item" href="/admin">
                        Admin Paneli
                      </Link>
                    </li>
                  )}
                   <li>
                    <Link className="dropdown-item" href="/messages">
                      Mesajlarım
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" href="/profile">
                      Profilim
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item">
                      Çıkış Yap
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              // KULLANICI GİRİŞ YAPMAMIŞSA:
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