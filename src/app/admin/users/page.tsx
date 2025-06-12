// src/app/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
  adSoyad: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Kullanıcılar yüklenemedi.');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Yetkilendirme token\'ı bulunamadı.');
      return;
    }

    if (confirm(`Kullanıcının rolünü "${newRole}" olarak değiştirmek istediğinizden emin misiniz?`)) {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: userId, role: newRole }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Rol güncellenemedi.');
        }
        // Başarılı olursa kullanıcıları tekrar yükle
        fetchUsers(token);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Yetkilendirme token\'ı bulunamadı.');
      return;
    }

    if (confirm('Kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const res = await fetch(`/api/admin/users?id=${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Kullanıcı silinemedi.');
        }
        // Başarılı olursa kullanıcıları listeden çıkar
        setUsers(users.filter(user => user.id !== userId));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center my-5">Kullanıcılar yükleniyor...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Kullanıcı Yönetimi</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Telefon</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.adSoyad}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="badge bg-danger">Admin</span>
                      ) : (
                        <select
                          className="form-select form-select-sm"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.role === 'admin'} // Admin rolünü değiştirmeyi engelle
                        >
                          <option value="user">User</option>
                          {/* İleride başka roller eklenirse buraya eklenebilir */}
                        </select>
                      )}
                    </td>
                    <td>{user.phone || '-'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'admin' && ( // Admin rolündeki kullanıcıyı silme butonunu gösterme
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <i className="bi bi-trash"></i> Sil
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}