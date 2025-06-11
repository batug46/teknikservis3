import React from 'react';

export default function ContactPage() {
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <h2 className="mb-4">İletişim Formu</h2>
          <form>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Adınız Soyadınız</label>
              <input type="text" className="form-control" id="name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
              <input type="email" className="form-control" id="email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Konu</label>
              <input type="text" className="form-control" id="subject" required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Mesajınız</label>
              <textarea className="form-control" id="message" rows={5} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Gönder</button>
          </form>
        </div>
        
        <div className="col-md-6">
          <h2 className="mb-4">İletişim Bilgileri</h2>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Teknoloji Mağazası</h5>
              <p className="card-text">
                <i className="bi bi-geo-alt-fill me-2"></i>
                Örnek Mahallesi, Teknoloji Caddesi No:123
                <br />
                Çankaya/Ankara
              </p>
              <p className="card-text">
                <i className="bi bi-telephone-fill me-2"></i>
                +90 555 555 5555
              </p>
              <p className="card-text">
                <i className="bi bi-envelope-fill me-2"></i>
                info@teknolojimagaza.com
              </p>
              <hr />
              <h6>Çalışma Saatleri</h6>
              <p className="card-text">
                <i className="bi bi-clock-fill me-2"></i>
                Hafta içi: 09:00 - 18:00
                <br />
                Cumartesi: 10:00 - 16:00
                <br />
                Pazar: Kapalı
              </p>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="mt-4">
            <h5>Sosyal Medya</h5>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-dark fs-4">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 