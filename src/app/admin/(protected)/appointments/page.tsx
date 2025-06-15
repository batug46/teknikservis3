'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Gelen verinin tipini tanımlıyoruz
interface Appointment {
  id: number;
  serviceType: string;
  description: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  user: { name: string | null };
  price: number; // Ücret için yeni alan
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/appointments');
            const data = await res.json();
            if (res.ok) {
              setAppointments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusChange = async (id: number, status: string) => {
      try {
        await fetch(`/api/admin/appointments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        fetchAppointments(); // Durum değişince listeyi yenile
      } catch (error) {
        alert('Durum güncellenemedi.');
      }
    };

    if (loading) return <div>Randevular yükleniyor...</div>;

    return (
        <>
            <h1 className="h2 pt-3 pb-2 mb-3 border-bottom">Randevu Yönetimi</h1>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Müşteri</th>
                            <th>Servis Tipi</th>
                            <th>Ücret</th>
                            <th>Tarih</th>
                            <th>Saat</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.id}</td>
                                <td>{appt.user?.name || 'Bilinmiyor'}</td>
                                <td>{appt.serviceType}</td>
                                <td>{appt.price.toFixed(2)} TL</td>
                                <td>{new Date(appt.date).toLocaleDateString()}</td>
                                <td>{appt.time}</td>
                                <td>
                                  <select
                                    className="form-select form-select-sm w-auto"
                                    value={appt.status}
                                    onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                  >
                                    <option value="pending">Bekliyor</option>
                                    <option value="confirmed">Onaylandı</option>
                                    <option value="completed">Tamamlandı</option>
                                    <option value="cancelled">İptal Edildi</option>
                                  </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}