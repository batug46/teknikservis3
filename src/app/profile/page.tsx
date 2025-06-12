'use client';

import React, { useState, useEffect } from 'react';

// Tipleri tanımlayalım
interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}
interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Form verileri için state'ler
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!storedUser) {
          window.location.href = '/login';
          return;
        }
        setUser(storedUser);
        setName(storedUser.name || '');
        setPhone(storedUser.phone || '');

        const ordersRes = await fetch('/api/profile/orders', { cache: 'no-store' });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Veri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword && !currentPassword) {
      setMessage({ type: 'danger', text: 'Yeni şifre belirlemek için mevcut şifrenizi girmelisiniz.' });
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profil güncellenemedi.');
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
      setCurrentPassword('');
      setNewPassword('');

    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message });
    }
  };

  if (loading || !user) {
    return <div className="container text-center my-5">Yükleniyor...</div>;
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="mb-3">{user.name}</h4>
              <p className="text-muted">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Profil Bilgileri</h5>
              {message.text && <div className={`alert alert-${message.type} mt-3`}>{message.text}</div>}
              <form onSubmit={handleUpdateProfile} className="mt-3">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Telefon</label>
                  <input type="tel" className="form-control" id="phone" value={phone || ''} onChange={e => setPhone(e.target.value)} />
                </div>
                <hr />
                <h6 className="mt-4">Şifre Değiştir</h6>
                <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Mevcut Şifre</label>
                    <input type="password" placeholder="Şifre değiştirmek için doldurun" className="form-control" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
                    <input type="password" className="form-control" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Bilgileri Güncelle</button>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title">Sipariş Geçmişim</h5>
              {orders.length > 0 ? (
                <table className="table mt-3">
                    <thead>
                    <tr>
                        <th>Sipariş ID</th>
                        <th>Tarih</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>{order.total.toFixed(2)} TL</td>
                        <td>{order.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              ) : (
                <p className="text-muted mt-3">Henüz sipariş vermediniz.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}