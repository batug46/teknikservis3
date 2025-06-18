import prisma from '../../../lib/prisma'; // Düzeltilmiş import yolu

async function getSlides() {
    return prisma.slider.findMany({
        orderBy: { order: 'asc' },
    });
}

export default async function Home() {
    const slides = await getSlides();

    return (
        <div>
            {/* Bootstrap Carousel */}
            {slides.length > 0 && (
                <div id="main-slider" className="carousel slide mb-5" data-bs-ride="carousel">
                    <div className="carousel-indicators">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                data-bs-target="#main-slider"
                                data-bs-slide-to={index}
                                className={index === 0 ? 'active' : ''}
                                aria-current={index === 0 ? 'true' : 'false'}
                                aria-label={`Slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                    <div className="carousel-inner">
                        {slides.map((slide, index) => (
                            <div key={slide.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <img src={slide.imageUrl} className="d-block w-100" alt={slide.title} style={{ maxHeight: '500px', objectFit: 'cover' }} />
                                <div className="carousel-caption d-none d-md-block">
                                    <h5>{slide.title}</h5>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#main-slider" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#main-slider" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            )}

            {/* ... Sayfanızın geri kalan içeriği burada devam edebilir ... */}
        </div>
    );
} 