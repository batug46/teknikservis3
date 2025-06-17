import prisma from '../lib/prisma';
import MainSlider from '../components/MainSlider'; // Slider bileşenimiz
import Link from 'next/link';

// Bu satır, sayfanın her zaman en güncel veriyi çekmesini sağlar.
export const dynamic = 'force-dynamic';

async function getSlides() {
    return prisma.slider.findMany({
        orderBy: { order: 'asc' },
    });
}

export default async function Home() {
    const slides = await getSlides();

    return (
        <div>
            {/* TIKLANABİLİR SLIDER BÖLÜMÜ */}
            <MainSlider slides={slides} />
            
            <div className="container my-5 text-center">
                <h2>Hizmetlerimiz</h2>
                {/* Buraya gelecekte hizmetlerinizle ilgili daha fazla içerik ekleyebilirsiniz. */}
            </div>
        </div>
    );
}