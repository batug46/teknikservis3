import prisma from '../lib/prisma';
import MainSlider from '../components/MainSlider';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getSlides() {
    try {
        const slides = await prisma.slider.findMany({
            orderBy: { order: 'asc' },
        });
        return slides;
    } catch (error) {
        console.error('Slider verileri alınırken hata:', error);
        return [];
    }
}

async function getServices() {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        return services;
    } catch (error) {
        console.error('Hizmet verileri alınırken hata:', error);
        return [];
    }
}

// Servis Kartı Bileşeni
function ServiceCard({ title, description, link, imageUrl }) {
  return (
    <div className="relative rounded-xl shadow-lg overflow-hidden group h-80 cursor-pointer will-change-transform transition-all duration-200 ease-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]">
      {/* Arka Plan Resmi */}
      {imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}
      
      {/* Overlay - Yazılar için koyu arka plan */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/85 group-hover:via-black/55 group-hover:to-black/25 transition-all duration-200 ease-out"></div>
      
      {/* İçerik */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 transition-transform duration-200 ease-out group-hover:translate-y-[-2px]">
        <h3 className="text-2xl font-bold text-white mb-3 font-display transition-all duration-200 ease-out group-hover:text-blue-200">{title}</h3>
        <p className="text-gray-200 mb-6 leading-relaxed transition-all duration-200 ease-out group-hover:text-gray-100">{description}</p>
        <div>
          <Link href={link} className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold text-sm transition-all duration-150 ease-out shadow-md hover:bg-white/30 hover:border-white/50 hover:shadow-lg hover:scale-105 transform">
          Detayları Gör
        </Link>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
    const slides = await getSlides();
    const services = await getServices();

    return (
        <div className="min-h-screen">
            {/* Hero Section with Tech Background */}
            <div className={`relative overflow-hidden ${
                slides && slides.length > 0 
                    ? '' 
                    : 'min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
            }`}>
                {/* Animated Background Elements - only show when no slides */}
                {(!slides || slides.length === 0) && (
                    <>
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>
                
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 opacity-40" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
                    </>
                )}
                
            {slides && slides.length > 0 ? (
                    <div className="relative z-10">
                <MainSlider slides={slides} />
                    </div>
            ) : (
                    <div className="relative z-10 flex items-center justify-center min-h-screen text-center px-4">
                        <div className="max-w-4xl">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent font-display">
                                Efe Bilgisayar ve Güvenlik Sistemleri - CI/CD Test
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed font-medium">
                                Teknolojide profesyonel çözümler, güvenilir hizmet
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/book-appointment" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-colors duration-200 ease-out shadow-lg hover:shadow-xl">
                                    Randevu Al
                                </Link>
                                <Link href="/products" className="px-8 py-4 border-2 border-blue-400/50 text-blue-100 rounded-lg font-semibold text-lg hover:bg-blue-500/20 backdrop-blur-sm transition-colors duration-200 ease-out">
                                    Ürünleri İncele
                                </Link>
                            </div>
                        </div>
                    </div>
            )}
            </div>
            
            {/* Hizmetler Bölümü */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
                <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236366f1\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tight font-display">Hizmetlerimiz</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Alanında uzman ekibimizle sunduğumuz profesyonel çözümler</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                        {services.length > 0 ? (
                            services.map((service) => (
                                <ServiceCard 
                                    key={service.id}
                                    title={service.title}
                                    description={service.description}
                                    link={service.linkUrl}
                                    imageUrl={service.imageUrl}
                                />
                            ))
                        ) : (
                            // Fallback hizmetler (eğer veritabanında hizmet yoksa)
                            <>
                        <ServiceCard 
                            title="Bilgisayar Tamiri"
                            description="Donanım ve yazılım sorunlarınıza hızlı, garantili ve güvenilir çözümler sunuyoruz."
                            link="/products?category=bilgisayar-tamiri"
                                    imageUrl="https://images.pexels.com/photos/4005596/pexels-photo-4005596.jpeg"
                        />
                        <ServiceCard 
                            title="Telefon Tamiri"
                            description="Ekran değişimi, batarya sorunları ve diğer tüm marka model telefon tamir işlemleri."
                            link="/products?category=telefon-tamiri"
                                    imageUrl="https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg"
                        />
                        <ServiceCard 
                            title="Güvenlik Sistemleri"
                            description="Kamera ve alarm sistemleri kurulumu ile ev ve iş yerinizi güvence altına alıyoruz."
                            link="/products?category=guvenlik-sistemleri"
                                    imageUrl="https://images.pexels.com/photos/277553/pexels-photo-277553.jpeg"
                        />
                            </>
                        )}
                    </div>
                </div>
            </section>
            
            {/* Bize Ulaşın Bölümü */}
            <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                </div>
                <div className="container mx-auto px-4 py-20 text-center relative z-10">
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white sm:text-5xl font-display">Hemen Destek Alın</h3>
                    <p className="mt-4 text-lg leading-6 text-blue-100 max-w-2xl mx-auto font-medium">
                        Profesyonel ekibimizle iletişime geçin, teknolojik sorunlarınıza anında çözüm bulalım.
                    </p>
                    <div className="mt-10 flex justify-center flex-wrap gap-6">
                        <a href="tel:+905555555555" className="inline-flex items-center justify-center px-8 py-4 bg-white/90 backdrop-blur-sm text-base font-medium rounded-lg text-blue-600 hover:bg-white transition-colors duration-200 ease-out transform hover:scale-105 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                            Telefonla Ara
                  </a>
                        <a href="mailto:info@teknikservis.com" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-base font-medium rounded-lg text-white hover:bg-white/10 backdrop-blur-sm transition-colors duration-200 ease-out">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            E-posta Gönder
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
