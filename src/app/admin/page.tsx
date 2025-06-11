import React from 'react';

export default function AdminDashboard() {
  return (
    <>
      {/* Bu bölüm, /admin yoluna özel olan ana içeriktir.
        Sidebar ve genel yapı, otomatik olarak layout.tsx dosyasından gelecektir.
      */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
      </div>

      {/* İstatistik Kartları */}
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5 className="card-title">Toplam Ürün</h5>
              {/* Bu değerler daha sonra dinamik olarak veritabanından çekilecektir. */}
              <p className="card-text display-6">150</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card text-white bg-success">
            <div className="card-body">
              <h5 className="card-title">Toplam Sipariş</h5>
              <p className="card-text display-6">45</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card text-white bg-info">
            <div className="card-body">
              <h5 className="card-title">Toplam Kullanıcı</h5>
              <p className="card-text display-6">250</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-4">
          <div className="card text-white bg-warning">
            <div className="card-body">
              <h5 className="card-title">Yeni Mesajlar</h5>
              <p className="card-text display-6">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Son Siparişler Tablosu */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Son Siparişler</h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Sipariş ID</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#1234</td>
                  <td>Ahmet Yılmaz</td>
                  <td>2024-03-20</td>
                  <td>2.499 TL</td>
                  <td><span className="badge bg-success">Tamamlandı</span></td>
                </tr>
                <tr>
                  <td>#1235</td>
                  <td>Mehmet Demir</td>
                  <td>2024-03-19</td>
                  <td>1.899 TL</td>
                  <td><span className="badge bg-warning">İşlemde</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
