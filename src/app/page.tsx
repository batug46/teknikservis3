'use client';

import React, { useState, useEffect } from 'react'; // useEffect'i import ediyoruz
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [heroImgSrc, setHeroImgSrc] = useState('/hero-image.jpg');
  const [isMounted, setIsMounted] = useState(false); // Hidrasyon hatasını önlemek için eklendi

  useEffect(() => {
    // Bu kod, bileşen tarayıcıya yüklendikten sonra çalışır
    setIsMounted(true);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="container-fluid bg-dark text-light py-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">Teknik Servis Hizmetleri</h1>
              <p className="lead">Profesyonel ekibimizle bilgisayar, telefon ve elektronik cihazlarınızın tamiri için yanınızdayız.</p>
              <div className="d-flex gap-3">
                <Link href="/book-appointment" className="btn btn-primary btn-lg">
                  <i className="bi bi-calendar-plus me-2"></i>Randevu Al
                </Link>
                <Link href="/products" className="btn btn-outline-light btn-lg">Ürünleri İncele</Link>
              </div>
            </div>
            <div className="col-lg-6" style={{ minHeight: '480px' }}> {/* Yüklenirken kaymayı önlemek için min-height */}
              {/* Hidrasyon hatasını önlemek için resmi sadece sayfa yüklendikten sonra render ediyoruz */}
              {isMounted && (
                <Image 
                  src={heroImgSrc} 
                  alt="Teknik Servis" 
                  width={720} 
                  height={480} 
                  className="img-fluid rounded shadow" 
                  priority
                  onError={() => {
                    // Eğer /hero-image.jpg yüklenemezse, kaynağı placeholder ile değiştir.
                    setHeroImgSrc('https://placehold.co/720x480/343A40/FFF?text=Teknik+Servis');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ... sayfanın geri kalan kısımları aynı kalabilir ... */}
      
    </div>
  );
}
