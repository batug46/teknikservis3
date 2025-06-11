import React from 'react';

export default function BookAppointment() {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Teknik Servis Randevusu Al</h2>
              
              <form>
                {/* Servis Tipi */}
                <div className="mb-3">
                  <label htmlFor="serviceType" className="form-label">Servis Tipi</label>
                  <select className="form-select" id="serviceType" required>
                    <option value="">Seçiniz</option>
                    <option value="computer_repair">Bilgisayar Tamiri</option>
                    <option value="phone_repair">Telefon Tamiri</option>
                    <option value="printer_repair">Yazıcı Tamiri</option>
                    <option value="network">Ağ Kurulumu</option>
                    <option value="maintenance">Bakım</option>
                  </select>
                </div>

                {/* Cihaz Bilgileri */}
                <div className="mb-3">
                  <label htmlFor="deviceType" className="form-label">Cihaz Türü</label>
                  <input type="text" className="form-control" id="deviceType" placeholder="Örn: Laptop, Masaüstü, Yazıcı" required />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="brand" className="form-label">Marka</label>
                    <input type="text" className="form-control" id="brand" placeholder="Örn: HP, Dell, Asus" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="model" className="form-label">Model</label>
                    <input type="text" className="form-control" id="model" placeholder="Örn: Pavilion, Latitude" required />
                  </div>
                </div>

                {/* Sorun Açıklaması */}
                <div className="mb-3">
                  <label htmlFor="problem" className="form-label">Sorun Açıklaması</label>
                  <textarea className="form-control" id="problem" rows={4} placeholder="Yaşadığınız sorunu detaylı bir şekilde açıklayın" required></textarea>
                </div>

                {/* Randevu Tarihi ve Saati */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="date" className="form-label">Randevu Tarihi</label>
                    <input type="date" className="form-control" id="date" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="time" className="form-label">Randevu Saati</label>
                    <select className="form-select" id="time" required>
                      <option value="">Seçiniz</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>

                {/* İletişim Tercihi */}
                <div className="mb-4">
                  <label className="form-label d-block">İletişim Tercihi</label>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="contactEmail" />
                    <label className="form-check-label" htmlFor="contactEmail">E-posta</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="contactPhone" />
                    <label className="form-check-label" htmlFor="contactPhone">Telefon</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="contactSMS" />
                    <label className="form-check-label" htmlFor="contactSMS">SMS</label>
                  </div>
                </div>

                {/* Bilgilendirme */}
                <div className="alert alert-info mb-4" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  Randevunuz onaylandıktan sonra seçtiğiniz iletişim yöntemiyle size bilgi verilecektir.
                </div>

                {/* Gönder Butonu */}
                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Randevu Oluştur
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