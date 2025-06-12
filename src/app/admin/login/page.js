// src/app/admin/login/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Giriş başarısız oldu.');
      }

      const data = await response.json();
      // Token artık HTTP-only cookie olarak ayarlandığı için localStorage'a kaydetmeye gerek yok.
      // Sadece kullanıcı bilgisini kaydediyoruz.
      localStorage.setItem('user', JSON.stringify(data.user));

      // Eğer kullanıcı admin rolüne sahipse admin paneline yönlendir
      if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        // Admin değilse, belki normal kullanıcı paneline veya ana sayfaya yönlendir
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Admin Giriş</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">E-posta</label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby="emailHelp"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="text-center mt-3">
          <Link href="/login" className="text-decoration-none">
            Normal Kullanıcı Girişi
          </Link>
        </div>
      </div>
    </div>
  );
}