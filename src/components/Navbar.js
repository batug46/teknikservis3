'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsMounted(true);
    
    const handleStorageChange = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);
      } catch (error) {
        console.error('Sepet verisi okunurken hata:', error);
        setCartCount(0);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      });
      localStorage.removeItem('cart');
      setCartCount(0);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  if (!isMounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-lg border-b border-gray-200/10">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-xl font-semibold py-4 block text-gray-900">
            Efe Bilgisayar ve Güvenlik Sistemleri
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20 dark:border-gray-700/30' 
        : 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-lg border-b border-gray-200/10 dark:border-gray-700/20'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
            Efe Bilgisayar ve Güvenlik Sistemleri
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 backdrop-blur-sm transition-all duration-150 ease-out hover:scale-110 will-change-transform"
          >
            <svg className={`h-6 w-6 text-gray-700 dark:text-gray-200 transition-transform duration-200 ease-out ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative top-full md:top-auto left-0 md:left-auto w-full md:w-auto mt-0 md:mt-0 ${isMenuOpen ? 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/30 shadow-lg' : ''} md:bg-transparent md:backdrop-blur-0 md:border-0 md:shadow-none`}>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-2 p-4 md:p-0">
              <Link href="/products" className="group px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative overflow-hidden">
                <span className="relative z-10">Ürünler</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left ease-out"></div>
              </Link>
              <Link href="/book-appointment" className="group px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative overflow-hidden">
                <span className="relative z-10">Randevu Al</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left ease-out"></div>
              </Link>
              <Link href="/contact" className="group px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative overflow-hidden">
                <span className="relative z-10">İletişim</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left ease-out"></div>
              </Link>
              <Link href="/about" className="group px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative overflow-hidden">
                <span className="relative z-10">Hakkımızda</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left ease-out"></div>
              </Link>

              {status === 'authenticated' && session?.user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 backdrop-blur-sm transition-all duration-150 ease-out will-change-transform"
                  >
                    <div className="h-8 w-8 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium transition-transform duration-150 ease-out">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="transition-all duration-150 ease-out">{session.user.name}</span>
                    <svg className={`h-4 w-4 ml-1 transition-all duration-200 ease-out ${isProfileOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-2 transform transition-all duration-200 ease-out origin-top-right will-change-transform">
                      {session.user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-all duration-150 ease-out rounded-lg">
                          <svg className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400 transition-transform duration-150 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="transition-all duration-150 ease-out">Admin Paneli</span>
                        </Link>
                      )}
                      <Link href="/messages" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-all duration-150 ease-out rounded-lg">
                        <svg className="h-5 w-5 mr-3 text-green-500 dark:text-green-400 transition-all duration-150 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="transition-all duration-150 ease-out">Mesajlarım</span>
                      </Link>
                      <Link href="/profile" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-all duration-150 ease-out rounded-lg">
                        <svg className="h-5 w-5 mr-3 text-indigo-500 dark:text-indigo-400 transition-all duration-150 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="transition-all duration-150 ease-out">Profilim</span>
                      </Link>
                      <hr className="my-2 border-gray-200/50 dark:border-gray-600/50" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/30 transition-all duration-150 ease-out rounded-lg"
                      >
                        <svg className="h-5 w-5 mr-3 transition-all duration-150 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="transition-all duration-150 ease-out">Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="group px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative overflow-hidden">
                    <span className="relative z-10">Giriş Yap</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-400/10 dark:to-indigo-400/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left ease-out"></div>
                  </Link>
                  <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transform hover:scale-105 transition-all duration-150 shadow-lg hover:shadow-xl ease-out">
                    Kayıt Ol
                  </Link>
                </>
              )}

              <Link href="/cart" className="group flex items-center px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-150 ease-out relative">
                <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-150 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="group-hover:translate-x-1 transition-transform duration-150 ease-out">Sepet</span>
                {cartCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full animate-pulse group-hover:scale-110 transition-transform duration-150 ease-out">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}