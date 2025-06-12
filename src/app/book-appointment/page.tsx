'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookAppointmentPage() {
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Bu API rotasını bir sonraki adımda oluşturacağız.
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Eğer kullanıcı giriş yapmamışsa (401 Unauthorized), giriş sayfasına yönlendir.
        if (res.status === 401) {
          router.push('/login?redirect=/book-appointment');
          return;
        }
        throw new Error(data.error || 'Randevu oluşturulurken bir hata oluştu.');
      }
      
      setSuccess('Randevunuz başarıyla oluşturuldu! Bilgilendirme için sizinle iletişime geçeceğiz.');
      // Formu temizle
      setFormData({ serviceType: '', description: '', date: '', time: '' });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Teknik Servis Randevusu Al</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="serviceType" className="form-label">Servis Tipi</label>
                  <select className="form-select" id="serviceType" value={formData.serviceType} onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    <option value="Bilgisayar Tamiri">Bilgisayar Tamiri</option>
                    <option value="Telefon Tamiri">Telefon Tamiri</option>
                    <option value="Kamera Kurulumu">Kamera Kurulumu</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Sorun Açıklaması</label>
                  <textarea className="form-control" id="description" rows={4} value={formData.description} onChange={handleChange} placeholder="Yaşadığınız sorunu kısaca açıklayın." required></textarea>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">Randevu Tarihi</label>
                    <input type="date" className="form-control" id="date" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label">Randevu Saati</label>
                    <select className="form-select" id="time" value={formData.time} onChange={handleChange} required>
                      <option value="">Seçiniz...</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                    </select>
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Gönderiliyor...' : 'Randevu Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
