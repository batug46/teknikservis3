'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import Image from 'next/image';
import Link from 'next/link';

const MainSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch('/api/slider'); // Veriyi API'den çek
        if (!res.ok) {
          throw new Error('Failed to fetch sliders');
        }
        const data = await res.json();
        setSliders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []); // Sadece bileşen yüklendiğinde bir kez çalışır

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="relative h-96">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
      >
        {sliders.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-96">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-4">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                {slide.link && (
                  <Link href={slide.link} legacyBehavior>
                    <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Daha Fazla Bilgi
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MainSlider;