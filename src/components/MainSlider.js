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
            <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!sliders || sliders.length === 0) {
        return (
            <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-500">
                Henüz slider eklenmemiş.
            </div>
        );
    }

    return (
        <div className="relative w-full h-[400px]">
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                effect="fade"
                loop={true}
                className="w-full h-full"
            >
                {sliders.map((slider) => (
                    <SwiperSlide key={slider.id}>
                        {slider.link ? (
                            <Link href={slider.link} className="block w-full h-full relative">
                                <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                    <h2 className="text-white text-3xl font-bold text-center px-4 drop-shadow-lg">
                                        {slider.title}
                                    </h2>
                                </div>
                            </Link>
                        ) : (
                            <div className="relative w-full h-full">
                                <img
                                    src={slider.imageUrl}
                                    alt={slider.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                    <h2 className="text-white text-3xl font-bold text-center px-4 drop-shadow-lg">
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