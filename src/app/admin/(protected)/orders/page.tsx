'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Tiplere yeni alanlar eklendi
interface OrderItem { id: number; rating: number | null; product: { name: string; }; quantity: number; }
interface Order { id: number; total: number; status: string; createdAt: string; user: { name: string | null; }; items: OrderItem[]; phone: string | null; address: string | null; }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/admin/orders');
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  if (loading) return <div>Siparişler yükleniyor...</div>;

  return (
    <>
      <h1 className="h2 pt-3 pb-2 mb-3 border-bottom">Sipariş Yönetimi</h1>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr><th>ID</th><th>Müşteri</th><th>Tarih</th><th>Tutar</th><th>Durum</th><th>İşlemler</th></tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user?.name || 'Silinmiş Kullanıcı'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.total.toFixed(2)} TL</td>
                <td><span className="badge bg-warning text-dark">{order.status}</span></td>
                <td><button className="btn btn-sm btn-info" onClick={() => setSelectedOrder(order)}>Detaylar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
         <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sipariş Detayları (#{selectedOrder.id})</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <h6>Müşteri Bilgileri</h6>
                  <p>
                    <strong>İsim:</strong> {selectedOrder.user?.name}<br/>
                    <strong>Telefon:</strong> {selectedOrder.phone || 'Belirtilmemiş'}<br/>
                    <strong>Adres:</strong> {selectedOrder.address || 'Belirtilmemiş'}
                  </p>
                  <hr/>
                  <h6>Ürünler</h6>
                   <table className="table mt-3">
                    <thead>
                        <tr>
                            <th>Ürün</th>
                            <th>Adet</th>
                            <th>Puan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedOrder.items && selectedOrder.items.map(item => (
                            <tr key={item.id}>
                                <td>{item.product.name}</td>
                                <td>{item.quantity}</td>
                                <td>{item.rating ? `${item.rating} / 5` : 'Puanlanmamış'}</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
