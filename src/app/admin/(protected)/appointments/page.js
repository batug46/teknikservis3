'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, Phone, MapPin, Trash2, CheckCircle, Clock3, XCircle, AlertCircle, PlayCircle, Eye, MessageSquare, Search, SortAsc, SortDesc } from 'lucide-react';

export default function AdminAppointmentsPage() {
    const [allAppointments, setAllAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Filtreleme state'leri
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, tomorrow, week, month
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');

    // Filtreleme ve sıralama işlemi
    useEffect(() => {
        let filtered = [...allAppointments];

        // Arama filtresi
        if (searchTerm) {
            filtered = filtered.filter(appointment => 
                appointment.id.toString().includes(searchTerm) ||
                appointment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.phone?.includes(searchTerm)
            );
        }

        // Durum filtresi
        if (statusFilter !== 'all') {
            filtered = filtered.filter(appointment => appointment.status === statusFilter);
        }

        // Tarih filtresi
        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            
            filtered = filtered.filter(appointment => {
                const appointmentDate = new Date(appointment.date);
                const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
                
                switch (dateFilter) {
                    case 'today':
                        return appointmentDay.getTime() === today.getTime();
                    case 'tomorrow':
                        return appointmentDay.getTime() === tomorrow.getTime();
                    case 'week':
                        const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return appointmentDay >= today && appointmentDay <= weekAhead;
                    case 'month':
                        const monthAhead = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                        return appointmentDay >= today && appointmentDay <= monthAhead;
                    default:
                        return true;
                }
            });
        }

        // Sıralama
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'date':
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case 'customer':
                    const aName = a.user?.name || a.user?.adSoyad || '';
                    const bName = b.user?.name || b.user?.adSoyad || '';
                    comparison = aName.localeCompare(bName, 'tr');
                    break;
                case 'service':
                    comparison = (a.serviceType || '').localeCompare(b.serviceType || '', 'tr');
                    break;
                case 'id':
                    comparison = a.id - b.id;
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        setFilteredAppointments(filtered);
    }, [allAppointments, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

    const fetchAppointments = useCallback(async () => {
      try {
        const res = await fetch('/api/admin/appointments');
        const data = await res.json();
        if (res.ok) {
          setAllAppointments(data);
        }
      } catch (error) {
          console.error("Randevular çekilemedi:", error);
      } finally {
          setLoading(false);
      }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusChange = async (id, status) => {
      setUpdating(true);
      try {
        const res = await fetch(`/api/admin/appointments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        
        if (res.ok) {
          const updatedAppointment = await res.json();
          // Tüm bilgileri güncelle
          setAllAppointments(allAppointments.map(appt => 
            appt.id === id ? updatedAppointment : appt
          ));
          // Selected appointment için de güncelle
          if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment(updatedAppointment);
          }
        } else {
          alert('Durum güncellenemedi.');
        }
      } catch (error) {
          console.error("Randevu güncellenirken hata:", error);
          alert('Bir hata oluştu.');
      } finally {
        setUpdating(false);
      }
    };

    const handleDelete = async (id) => {
      if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
        try {
          const res = await fetch(`/api/admin/appointments/${id}`, {
            method: 'DELETE',
          });
          
          if (res.ok) {
            setAllAppointments(allAppointments.filter(appt => appt.id !== id));
            setSelectedAppointment(null);
          } else {
                alert('Randevu silinemedi.');
          }
        } catch (error) {
            console.error("Randevu silinirken hata:", error);
            alert('Bir hata oluştu.');
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { 
                bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
                text: 'text-yellow-800 dark:text-yellow-300', 
                icon: Clock, 
                label: 'Bekliyor' 
            },
            CONFIRMED: { 
                bg: 'bg-blue-100 dark:bg-blue-900/30', 
                text: 'text-blue-800 dark:text-blue-300', 
                icon: CheckCircle, 
                label: 'Onaylandı' 
            },
            IN_PROGRESS: { 
                bg: 'bg-purple-100 dark:bg-purple-900/30', 
                text: 'text-purple-800 dark:text-purple-300', 
                icon: PlayCircle, 
                label: 'Devam Ediyor' 
            },
            CANCELLED: { 
                bg: 'bg-red-100 dark:bg-red-900/30', 
                text: 'text-red-800 dark:text-red-300', 
                icon: XCircle, 
                label: 'İptal Edildi' 
            },
        };
        
        const badge = badges[status] || { 
            bg: 'bg-gray-100 dark:bg-gray-700', 
            text: 'text-gray-800 dark:text-gray-300', 
            icon: AlertCircle, 
            label: status 
        };
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setDateFilter('all');
        setSortBy('date');
        setSortOrder('asc');
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Randevular yükleniyor...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                    <Calendar className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
                    Randevu Yönetimi
                </h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredAppointments.length} / {allAppointments.length} randevu
                </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Arama */}
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Randevu ID, müşteri, hizmet veya problem ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        />
                    </div>

                    {/* Durum Filtresi */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="PENDING">Bekliyor</option>
                            <option value="CONFIRMED">Onaylandı</option>
                            <option value="IN_PROGRESS">Devam Ediyor</option>
                            <option value="CANCELLED">İptal Edildi</option>
                        </select>
                    </div>

                    {/* Tarih Filtresi */}
                    <div>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            <option value="all">Tüm Tarihler</option>
                            <option value="today">Bugün</option>
                            <option value="tomorrow">Yarın</option>
                            <option value="week">Gelecek 7 Gün</option>
                            <option value="month">Gelecek 30 Gün</option>
                        </select>
                    </div>

                    {/* Sıralama ve Temizle */}
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                            <option value="date">Tarihe Göre</option>
                            <option value="customer">Müşteriye Göre</option>
                            <option value="service">Hizmete Göre</option>
                            <option value="id">ID'ye Göre</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                            title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
                        >
                            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Temizle Butonu ve Sonuç Sayısı */}
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredAppointments.length} randevu bulundu
                    </div>
                    {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'asc') && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        >
                            Filtreleri Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* Randevular Tablosu */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                                <th className="w-16 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="w-48 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Müşteri</th>
                                <th className="w-32 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih/Saat</th>
                                <th className="w-32 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hizmet</th>
                                <th className="w-24 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                                <th className="w-48 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İletişim</th>
                                <th className="w-32 px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        #{appointment.id}
                                    </td>
                                    <td className="px-3 py-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {appointment.user?.name || 'Silinmiş Kullanıcı'}
                                            </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {appointment.user?.email}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xs">
                                                {new Date(appointment.date).toLocaleDateString('tr-TR')}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {appointment.time}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                                        <div className="truncate" title={appointment.serviceType}>
                                            {appointment.serviceType}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        {getStatusBadge(appointment.status)}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-900 dark:text-gray-100">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs">
                                                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                                <span className="truncate">{appointment.phone || 'Belirtilmemiş'}</span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                <span className="truncate">{appointment.address || 'Belirtilmemiş'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-1">
                                            <button 
                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                                onClick={() => setSelectedAppointment(appointment)}
                                            >
                                                <Eye className="w-3 h-3" />
                                            </button>
                                            <button 
                                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                                onClick={() => handleDelete(appointment.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Boş Durum */}
                {filteredAppointments.length === 0 && (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                                ? 'Arama kriterlerinize uygun randevu bulunamadı.' 
                                : 'Henüz randevu bulunmuyor.'}
                        </h3>
                        {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Filtreleri temizle
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Randevu Detay Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                                <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Randevu Detayları - #{selectedAppointment.id}
                                    </h3>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(selectedAppointment.date).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} - {selectedAppointment.time}
                                </div>
                                </div>

                            <div className="space-y-6">
                                {/* Durum Güncelleme */}
                                    <div>
                                    <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">RANDEVU DURUMU</h6>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                    selectedAppointment.status === 'PENDING'
                                                        ? 'bg-yellow-600 text-white' 
                                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}
                                                onClick={() => handleStatusChange(selectedAppointment.id, 'PENDING')}
                                                disabled={updating}
                                            >
                                            <Clock className="w-4 h-4 inline mr-1" />
                                                Bekliyor
                                            </button>
                                            <button
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                    selectedAppointment.status === 'CONFIRMED'
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}
                                                onClick={() => handleStatusChange(selectedAppointment.id, 'CONFIRMED')}
                                                disabled={updating}
                                            >
                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                Onaylandı
                                            </button>
                                            <button
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                    selectedAppointment.status === 'IN_PROGRESS'
                                                    ? 'bg-purple-600 text-white' 
                                                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                                                }`}
                                                onClick={() => handleStatusChange(selectedAppointment.id, 'IN_PROGRESS')}
                                                disabled={updating}
                                            >
                                                <PlayCircle className="w-4 h-4 inline mr-1" />
                                                Devam Ediyor
                                            </button>
                                            <button
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                                    selectedAppointment.status === 'CANCELLED'
                                                        ? 'bg-red-600 text-white' 
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                                onClick={() => handleStatusChange(selectedAppointment.id, 'CANCELLED')}
                                                disabled={updating}
                                            >
                                                <XCircle className="w-4 h-4 inline mr-1" />
                                                İptal Edildi
                                            </button>
                                        </div>
                                    </div>

                                {/* Müşteri Bilgileri */}
                                    <div>
                                    <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">MÜŞTERİ BİLGİLERİ</h6>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">İsim:</span> {selectedAppointment.user?.name || 'Belirtilmemiş'}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {selectedAppointment.user?.email || 'Belirtilmemiş'}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Telefon:</span> {selectedAppointment.phone || 'Belirtilmemiş'}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Adres:</span> {selectedAppointment.address || 'Belirtilmemiş'}</div>
                                    </div>
                                </div>

                                {/* Randevu Bilgileri */}
                                                <div>
                                    <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">RANDEVU BİLGİLERİ</h6>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Hizmet:</span> {selectedAppointment.serviceType}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Özel Notlar:</span> {selectedAppointment.description || 'Belirtilmemiş'}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Fiyat:</span> {selectedAppointment.price ? `${selectedAppointment.price} ₺` : 'Belirtilmemiş'}</div>
                                        <div><span className="font-semibold text-gray-700 dark:text-gray-300">Oluşturulma:</span> {new Date(selectedAppointment.createdAt).toLocaleDateString('tr-TR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                        })}</div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                            
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6">
                                <button
                                    type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 dark:bg-gray-500 text-base font-medium text-white hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                                    onClick={() => setSelectedAppointment(null)}
                                >
                                    Kapat
                                </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 