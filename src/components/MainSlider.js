'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Image from 'next/image';
import Link from 'next/link';

const MainSlider = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const res = await fetch('/api/slider');
                if (!res.ok) {
                    throw new Error('Slider verileri alınamadı');
                }
                const data = await res.json();
                setSliders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Slider fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSliders();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!sliders || sliders.length === 0) {
        return (
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center text-gray-500">
                Henüz slider eklenmemiş.
            </div>
        );
    }

    return (
        <div className="relative w-full h-[500px] mb-8">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                effect="fade"
                loop={true}
                className="w-full h-full rounded-lg overflow-hidden shadow-xl"
            >
                {sliders.map((slider) => (
                    <SwiperSlide key={slider.id}>
                        {slider.link ? (
                            <Link href={slider.link} className="block w-full h-full relative group">
                                <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center transition-opacity duration-300">
                                    <div className="text-center px-4 transform transition-transform duration-300 group-hover:scale-105">
                                        <h2 className="text-white text-4xl font-bold mb-4 drop-shadow-lg">
                                            {slider.title}
                                        </h2>
                                        <span className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Daha Fazla
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="relative w-full h-full">
                                <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                                    <h2 className="text-white text-4xl font-bold text-center px-4 drop-shadow-lg">
                                        {slider.title}
                                    </h2>
                                </div>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default MainSlider;