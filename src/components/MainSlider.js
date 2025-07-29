'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MainSlider({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeProducts, setActiveProducts] = useState(new Set());

  // Ürün linklerinin aktif olup olmadığını kontrol et
  useEffect(() => {
    const checkActiveProducts = async () => {
      const productLinks = slides
        ?.filter(slide => slide.linkUrl?.startsWith('/products/'))
        ?.map(slide => {
          const productId = slide.linkUrl.split('/').pop();
          return { slideId: slide.id, productId };
        }) || [];

      if (productLinks.length === 0) return;

      try {
        const promises = productLinks.map(async ({ slideId, productId }) => {
          const response = await fetch('/api/products/check-active', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
          });
          
          if (response.ok) {
            const { isActive } = await response.json();
            return { slideId, isActive };
          }
          return { slideId, isActive: false };
        });

        const results = await Promise.all(promises);
        const activeSet = new Set();
        
        results.forEach(({ slideId, isActive }) => {
          if (isActive) {
            activeSet.add(slideId);
          }
        });
        
        setActiveProducts(activeSet);
      } catch (error) {
        console.error('Ürün aktiflik kontrolü hatası:', error);
      }
    };

    checkActiveProducts();
  }, [slides]);

  useEffect(() => {
    if (!slides || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
    }, 5000); // 5 saniyede bir slide değiştir

    return () => clearInterval(interval);
  }, [slides]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const handleImageError = (e) => {
    e.currentTarget.src = 'https://placehold.co/1200x500.png?text=Gorsel+Bulunamadi';
  };

  if (!slides || slides.length === 0) {
    return null;
  }



  return (
    <div className="relative w-full" style={{ height: '500px' }}>
      <div className="relative h-full overflow-hidden">
        {slides.map((slide, index) => {
          const isProductLink = slide.linkUrl?.startsWith('/products/');
          const isActive = isProductLink ? activeProducts.has(slide.id) : true;
          
          return (
            <div
              key={slide.id}
              className={`absolute w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              {isActive ? (
                <Link href={slide.linkUrl || '#'}>
                  <img
                    src={slide.imageUrl}
                    className="w-full h-full object-cover"
                    alt={slide.title}
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center">
                    <div className="text-white text-center p-8 max-w-2xl">
                      <h5 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-2xl">{slide.title}</h5>
                      <div className="w-16 h-1 bg-white/70 mx-auto rounded-full"></div>
                    </div>
                  </div>
                </Link>
                             ) : (
                 <div className="cursor-not-allowed">
                   <img
                     src={slide.imageUrl}
                     className="w-full h-full object-cover opacity-30"
                     alt={slide.title}
                     onError={handleImageError}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 flex items-center justify-center">
                     <div className="text-white text-center p-8 max-w-2xl">
                       <h5 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-2xl">{slide.title}</h5>
                       <div className="w-16 h-1 bg-red-400 mx-auto rounded-full mb-4"></div>
                       <div className="bg-red-600/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-red-400/50">
                         <p className="text-lg font-semibold text-white">Bu ürün artık mevcut değil</p>
                         <p className="text-sm text-red-100 mt-1">Ürün devre dışı bırakılmıştır</p>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition-all duration-300 hover:scale-110 text-white border border-white/20"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm p-3 rounded-full hover:bg-black/60 transition-all duration-300 hover:scale-110 text-white border border-white/20"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full border border-white/30 backdrop-blur-sm hover:scale-125 ${
              index === currentIndex 
                ? 'w-12 h-3 bg-white/90' 
                : 'w-3 h-3 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 