'use client';

import React from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

interface MainSliderProps {
  slides: Slide[];
}

export default function MainSlider({ slides }: MainSliderProps) {
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/1200x500.png?text=Gorsel+Bulunamadi';
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <div id="main-slider" className="carousel slide mb-5" data-bs-ride="carousel">
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <Link href={slide.linkUrl || '#'}>
                <img 
                  src={slide.imageUrl} 
                  className="d-block w-100" 
                  alt={slide.title} 
                  style={{ maxHeight: '500px', objectFit: 'cover', cursor: 'pointer' }}
                  onError={handleImageError}
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>{slide.title}</h5>
                </div>
            </Link>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#main-slider" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#main-slider" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </>
      )}
    </div>
  );
}
