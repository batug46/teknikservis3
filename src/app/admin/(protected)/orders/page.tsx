'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string | null } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  if (loading) return <div>Siparişler yükleniyor...</div>;

  return (
    <>
      <h1 className="h2 pt-3 pb-2 mb-3 border-bottom">Sipariş Yönetimi</h1>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Sipariş ID</th>
              <th>Müşteri Adı</th>
              <th>Tarih</th>
              <th>Tutar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user?.name || 'Silinmiş Kullanıcı'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.total.toFixed(2)} TL</td>
                <td>
                  <span className="badge bg-warning text-dark">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}