'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Appointment {
  id: number; serviceType: string; date: string; time: string; status: string; user: { name: string | null } | null;
}

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/appointments');
            const data = await res.json();
            if(res.ok) setAppointments(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    if (loading) return <div>Randevular yükleniyor...</div>;

    return (
        <>
            <h1 className="h2 pt-3 pb-2 mb-3 border-bottom">Randevu Yönetimi</h1>
            <table className="table table-striped">
                <thead>
                    <tr><th>ID</th><th>Müşteri</th><th>Servis Tipi</th><th>Tarih</th><th>Saat</th><th>Durum</th></tr>
                </thead>
                <tbody>
                    {appointments.map((appt) => (
                        <tr key={appt.id}>
                            <td>{appt.id}</td>
                            <td>{appt.user?.name || 'Silinmiş Kullanıcı'}</td>
                            <td>{appt.serviceType}</td>
                            <td>{new Date(appt.date).toLocaleDateString()}</td>
                            <td>{appt.time}</td>
                            <td>{appt.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
