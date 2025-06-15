import prisma from '../lib/prisma';
import MainSlider from '../components/MainSlider'; // Yeni slider bileşenini import ediyoruz

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
            <MainSlider slides={slides} />
            
            <div className="container">
              {/* Sayfanızın geri kalan içeriği (Hizmetlerimiz vb.) burada devam edebilir */}
              <h2 className="text-center">Hizmetlerimiz</h2>
              {/* ... */}
            </div>
        </div>
    );
}