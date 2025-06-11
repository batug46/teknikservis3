import React from 'react';

export default function AdminAppointments() {
  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Randevu Yönetimi</h1>
      </div>

      {/* Filtreler */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select className="form-select">
            <option value="">Tüm Durumlar</option>
            <option value="pending">Bekleyen</option>
            <option value="confirmed">Onaylanmış</option>
            {/* Diğer opsiyonlar */}
          </select>
        </div>
        {/* Diğer filtreleme elemanları */}
      </div>

      {/* Randevu Listesi */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Müşteri</th>
                  <th>Servis Tipi</th>
                  <th>Tarih</th>
                  <th>Saat</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#1001</td>
                  <td>Ahmet Yılmaz</td>
                  <td>Bilgisayar Tamiri</td>
                  <td>2024-03-21</td>
                  <td>14:30</td>
                  <td><span className="badge bg-warning">Bekliyor</span></td>
                  <td>
                    <button className="btn btn-sm btn-success me-2" title="Onayla">
                      <i className="bi bi-check-lg"></i>
                    </button>
                    {/* Diğer butonlar */}
                  </td>
                </tr>
                {/* Diğer randevu satırları */}
              </tbody>
            </table>
          </div>
          {/* Sayfalama */}
        </div>
      </div>
    </>
  );
}