import React from 'react';

export default function AdminProducts() {
  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Ürün Yönetimi</h1>
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addProductModal">
          <i className="bi bi-plus-lg me-2"></i>Yeni Ürün Ekle
        </button>
      </div>

      {/* Ürün Listesi */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              {/* Tablo Başlığı */}
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resim</th>
                  <th>Ürün Adı</th>
                  <th>Fiyat</th>
                  <th>Stok</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              {/* Örnek Tablo İçeriği */}
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    <img src="/product1.jpg" alt="Ürün 1" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                  </td>
                  <td>Laptop Model X</td>
                  <td>12.999 TL</td>
                  <td>25</td>
                  <td><span className="badge bg-success">Aktif</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-danger">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>
                    <img src="/product2.jpg" alt="Ürün 2" style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                  </td>
                  <td>Akıllı Telefon Y</td>
                  <td>8.499 TL</td>
                  <td>15</td>
                  <td><span className="badge bg-success">Aktif</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-danger">
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Sayfalama vb. diğer elementler... */}
        </div>
      </div>

      {/* Yeni Ürün Ekleme Modal'ı buraya dahil edilebilir veya ayrı bir component yapılabilir. */}
    </>
  );
}