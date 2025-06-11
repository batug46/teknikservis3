'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// AuthContext veya benzeri bir yapıdan kullanıcı bilgilerini alacağımızı varsayıyoruz.
// Şimdilik localStorage'dan basit bir okuma yapalım.
const getAuthData = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  }
  return { token: null, user: null };
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const authData = getAuthData();
    if (!authData.token || !authData.user) {
      router.push('/login'); // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    } else {
      setUser(authData.user);
      setName(authData.user.adSoyad || '');
      setEmail(authData.user.email || '');
      setPhone(authData.user.phone || '');
    }
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword && newPassword !== confirmNewPassword) {
      setMessage({ type: 'danger', text: 'Yeni şifreler eşleşmiyor.' });
      setLoading(false);
      return;
    }

    try {
      // Bu API rotasını daha sonra oluşturacağız
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthData().token}`
        },
        body: JSON.stringify({ name, phone, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Profil güncellenemedi.');
      }
      
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi!' });
      // Gerekirse güncel kullanıcı bilgisini localStorage'a kaydedebilirsiniz.
      localStorage.setItem('user', JSON.stringify(data.user));

    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="container my-5 text-center">Yükleniyor...</div>;
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <img src="/default-avatar.jpg" alt="Profil Resmi" className="rounded-circle mb-3" style={{width: '150px', height: '150px', objectFit: 'cover'}} />
              <h4>{user.name}</h4>
              <p className="text-muted">{user.email}</p>
            </div>
          </div>
          <div className="card">
            <div className="list-group list-group-flush">
              <Link href="/profile/orders" className="list-group-item list-group-item-action">
                <i className="bi bi-box me-2"></i>Siparişlerim
              </Link>
              {/* Diğer hızlı bağlantılar... */}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Profil Bilgileri</h5>
              
              {message.text && (
                 <div className={`alert alert-${message.type}`} role="alert">
                   {message.text}
                 </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta</label>
                  <input type="email" className="form-control" id="email" value={email} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Telefon</label>
                  <input type="tel" className="form-control" id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                
                <hr className="my-4" />
                <h6 className="mb-3">Şifre Değiştir</h6>

                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Mevcut Şifre</label>
                  <input type="password" placeholder="Şifre değiştirmek için doldurun" className="form-control" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
                  <input type="password" className="form-control" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmNewPassword" className="form-label">Yeni Şifre Tekrar</label>
                  <input type="password" className="form-control" id="confirmNewPassword" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Güncelleniyor...' : 'Bilgileri Güncelle'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
