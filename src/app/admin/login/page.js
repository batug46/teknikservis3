'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Giriş denemesi:', { email });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('API yanıtı:', { status: res.status });
      
      const data = await res.json();
      console.log('API veri:', { ...data, user: data.user ? { ...data.user, password: undefined } : null });

      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılırken bir hata oluştu');
      }

      if (data.user?.role !== 'admin') {
        throw new Error('Bu panele sadece adminler giriş yapabilir.');
      }
      
      // Kullanıcı bilgisini tarayıcıya kaydet
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Navbar'ı güncellemesi için haber ver
      window.dispatchEvent(new Event('authChange'));
      
      // Admin paneline yönlendir
      window.location.href = '/admin';

    } catch (err) {
      console.error('Giriş hatası:', err);
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="col-md-4">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Admin Girişi</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  id="email"
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Şifre</label>
                <input 
                  type="password" 
                  id="password"
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 