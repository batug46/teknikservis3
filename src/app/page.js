import prisma from '../lib/prisma';
import MainSlider from '../components/MainSlider';
import Link from 'next/link';

// Force dynamic rendering and disable caching
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getSlides() {
    try {
        const slides = await prisma.slider.findMany({
            where: {
                imageUrl: {
                    not: null
                }
            },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                linkUrl: true,
                order: true
            }
        });
        console.log('Loaded slides:', slides); // Debug log
        return slides || [];
    } catch (error) {
        console.error('Error fetching slides:', error);
        return [];
    }
}

export default async function Home() {
    const slides = await getSlides();
    console.log('Rendering slides:', slides); // Debug log

    return (
        <div>
            {slides && slides.length > 0 ? (
                <MainSlider slides={slides} />
            ) : (
                <div className="text-center py-5">
                    <p className="text-muted">Henüz slider eklenmemiş.</p>
                </div>
            )}
            
            <div className="container my-5 text-center">
                <h2 className="mb-4">Hizmetlerimiz</h2>
                <p className="lead text-muted col-lg-8 mx-auto">
                    Teknoloji dünyasındaki tüm ihtiyaçlarınız için buradayız. Uzman ekibimizle bilgisayar ve telefon tamirinden, güvenlik kamerası sistemleri kurulumuna kadar geniş bir yelpazede profesyonel çözümler sunuyoruz.
                </p>
                
                {/* İLETİŞİM BÖLÜMÜ BAŞLIĞI EKLENDİ */}
                <h3 className="mt-5 mb-3">Bize Ulaşın</h3>
                <div className="d-flex justify-content-center flex-wrap gap-3">
                  <a href="tel:+905555555555" className="btn btn-outline-primary btn-lg">
                    <i className="bi bi-telephone-fill me-2"></i>
                    +90 555 555 55 55
                  </a>
                  <a href="mailto:info@teknikservis.com" className="btn btn-outline-success btn-lg">
                    <i className="bi bi-envelope-fill me-2"></i>
                    info@teknikservis.com
                  </a>
                </div>
            </div>
        </div>
    );
}
