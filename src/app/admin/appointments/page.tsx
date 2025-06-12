// src/app/admin/appointments/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: number;
  serviceType: string;
  description: string;
  date: string; // ISO string formatında tarih
  time: string;
  status: string;
  user: {
    name: string;
    email: string;
    adSoyad: string;
    phone: string | null;
  };
  createdAt: string;
}

const statusColors = {
  'pending': 'bg-warning text-dark', // Bootstrap 5 uyumlu
  'confirmed': 'bg-success',
  'cancelled': 'bg-danger',
  // Diğer durumlar için renk ekleyebilirsiniz
};

const statusOptions = ['pending', 'confirmed', 'cancelled']; // Randevu durum seçenekleri

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // Randevu durumuna göre filtreleme
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const res = await fetch('/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Randevular yüklenemedi.');
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Yetkilendirme token\'ı bulunamadı.');
      return;
    }

    if (confirm(`Randevunun durumunu "${newStatus}" olarak değiştirmek istediğinizden emin misiniz?`)) {
      try {
        const res = await fetch('/api/admin/appointments', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id: appointmentId, status: newStatus }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Randevu durumu güncellenemedi.');
        }
        fetchAppointments(token); // Başarılı olursa randevuları tekrar yükle
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Yetkilendirme token\'ı bulunamadı.');
      return;
    }

    if (confirm('Randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const res = await fetch(`/api/admin/appointments?id=${appointmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Randevu silinemedi.');
        }
        setAppointments(appointments.filter(app => app.id !== appointmentId)); // Başarılı olursa listeden çıkar
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const filteredAppointments = filterStatus
    ? appointments.filter(app => app.status === filterStatus)
    : appointments;

  if (loading) return <div className="text-center my-5">Randevular yükleniyor...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Randevu Yönetimi</h1>
      </div>

      {/* Filtreler */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Randevu Listesi */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Müşteri</th>
                  <th>Servis Tipi</th>
                  <th>Cihaz/Problem</th>
                  <th>Randevu Tarihi/Saati</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>#{app.id}</td>
                    <td>
                      <p className="mb-0 fw-bold">{app.user?.adSoyad || app.user?.name}</p>
                      <small className="text-muted">{app.user?.email}</small>
                      {app.user?.phone && <small className="d-block text-muted">Tel: {app.user.phone}</small>}
                    </td>
                    <td>{app.serviceType}</td>
                    <td>{app.description?.substring(0, 50)}{app.description && app.description.length > 50 ? '...' : ''}</td>
                    <td>
                      {new Date(app.date).toLocaleDateString()} <br/>
                      <span className="text-muted">{app.time}</span>
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm ${statusColors[app.status]}`}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteAppointment(app.id)}
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
    </>
  );
}