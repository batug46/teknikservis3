'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (password !== confirmPassword) {
      setMessage({ type: 'danger', text: 'Şifreler eşleşmiyor.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: adSoyad, adSoyad, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
      }
      
      setMessage({ type: 'success', text: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...' });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      // Hata mesajını daha güvenli bir şekilde yakalıyoruz.
      if (err instanceof Error) {
        setMessage({ type: 'danger', text: err.message });
      } else {
        setMessage({ type: 'danger', text: 'Bilinmeyen bir hata oluştu.' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Kayıt Ol</h2>
              
              {message.text && (
                <div className={`alert alert-${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Ad Soyad</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={adSoyad}
                    onChange={(e) => setAdSoyad(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                    </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <Link href="/login" className="text-decoration-none">
                  Zaten hesabınız var mı? Giriş yapın
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
