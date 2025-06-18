'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mesaj gönderilemedi.');
      
      setStatus({ type: 'success', text: 'Mesajınız başarıyla gönderildi!' });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Formu temizle
    } catch (err) {
      setStatus({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <h2 className="mb-4">İletişim Formu</h2>
          <form onSubmit={handleSubmit}>
            {status.text && <div className={`alert alert-${status.type}`}>{status.text}</div>}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Adınız Soyadınız</label>
              <input type="text" className="form-control" id="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
              <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Konu</label>
              <input type="text" className="form-control" id="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Mesajınız</label>
              <textarea className="form-control" id="message" rows={5} value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
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
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 