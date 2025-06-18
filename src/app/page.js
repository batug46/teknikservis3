import prisma from '../lib/prisma';
import MainSlider from '../components/MainSlider';
import Link from 'next/link';

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
