// src/app/admin/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const statusColors = {
  'beklemede': 'badge bg-warning text-dark',
  'onaylandı': 'badge bg-info text-dark',
  'hazırlanıyor': 'badge bg-primary',
  'kargoda': 'badge bg-success',
  'tamamlandı': 'badge bg-success',
  'iptal': 'badge bg-danger'
};

const statusOptions = [
  'beklemede',
  'onaylandı',
  'hazırlanıyor',
  'kargoda',
  'tamamlandı',
  'iptal'
];

export default function OrdersManagement() {
  const router = useRouter();
  const [user, setUser] = useState(null); // localStorage'dan gelen kullanıcı bilgisi
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token) => {
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Siparişler yüklenemedi.');
      }

      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sipariş durumu güncellenemedi.');
      }

      fetchOrders(token); // Siparişleri tekrar yükle
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sipariş silinemedi.');
      }

      fetchOrders(token); // Siparişleri tekrar yükle
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) return <div className="text-center my-5">Siparişler yükleniyor...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  // Kullanıcının rolü admin değilse gösterme
  if (!user || user.role !== 'admin') {
    return <div className="alert alert-danger my-5">Bu sayfayı görüntülemek için admin yetkisine sahip olmalısınız.</div>;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Sipariş Yönetimi</h1>
      </div>

      <div className="card mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="py-3 px-4">Sipariş ID</th>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Ürünler</th>
                  <th className="py-3 px-4">Toplam Tutar</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="align-middle px-4">#{order.id}</td>
                    <td className="align-middle px-4">
                      <p className="fw-bold mb-0">{order.user?.adSoyad || order.user?.name || 'Bilinmeyen Müşteri'}</p>
                      <small className="text-muted">{order.user?.email}</small>
                      {order.user?.phone && <small className="d-block text-muted">Tel: {order.user.phone}</small>}
                    </td>
                    <td className="align-middle px-4">
                      <ul className="list-unstyled mb-0">
                        {order.items?.map((item) => (
                          <li key={item.id} className="text-sm">
                            {item.product?.name} x {item.quantity} ({item.price.toFixed(2)} TL)
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="align-middle px-4">{order.total.toFixed(2)} TL</td>
                    <td className="align-middle px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`form-select form-select-sm ${statusColors[order.status]}`}
                        style={{ width: 'auto', display: 'inline-block' }}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="align-middle px-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="align-middle px-4">
                      <button
                        className="btn btn-sm btn-info text-white me-2"
                        onClick={() => handleShowDetails(order)}
                      >
                        <i className="bi bi-eye"></i> Detay
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(order.id)}
                      >
                        <i className="bi bi-trash"></i> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sipariş Detay Modalı */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sipariş Detayı - #{selectedOrder?.id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {selectedOrder && (
                  <>
                    <h5>Müşteri Bilgileri</h5>
                    <p>
                      <strong>Ad Soyad:</strong> {selectedOrder.user?.adSoyad || selectedOrder.user?.name}<br />
                      <strong>E-posta:</strong> {selectedOrder.user?.email}<br />
                      <strong>Telefon:</strong> {selectedOrder.user?.phone || 'Yok'}
                    </p>

                    <h5 className="mt-4">Sipariş Edilen Ürünler</h5>
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>Ürün Adı</th>
                          <th>Birim Fiyat</th>
                          <th>Adet</th>
                          <th>Toplam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map(item => (
                          <tr key={item.id}>
                            <td>{item.product?.name || 'Ürün Bilgisi Yok'}</td>
                            <td>{item.price.toFixed(2)} TL</td>
                            <td>{item.quantity}</td>
                            <td>{(item.price * item.quantity).toFixed(2)} TL</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="3" className="text-end fw-bold">Genel Toplam:</td>
                          <td className="fw-bold">{selectedOrder.total.toFixed(2)} TL</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="mt-4">Sipariş Durumu</h5>
                    <div className="d-flex align-items-center">
                      <span className={`${statusColors[selectedOrder.status]} px-3 py-1 rounded-pill me-3`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                      <select
                        className="form-select w-auto"
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleStatusChange(selectedOrder.id, e.target.value);
                          setShowModal(false); // Güncelleme sonrası modalı kapat
                        }}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>} {/* Modal arka planı */}
    </div>
  );
}