'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Package, Clock, CheckCircle, XCircle, AlertCircle, Search, SortAsc, SortDesc, Calendar, Trash2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtreleme ve sıralama işlemi
  useEffect(() => {
    let filtered = [...allOrders];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.adSoyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tarih filtresi
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
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
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'total':
          comparison = parseFloat(a.total) - parseFloat(b.total);
          break;
        case 'customer':
          const aName = a.user?.name || a.user?.adSoyad || '';
          const bName = b.user?.name || b.user?.adSoyad || '';
          comparison = aName.localeCompare(bName, 'tr');
          break;
        case 'id':
          comparison = a.id - b.id;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(filtered);
  }, [allOrders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // Güvenli fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
      }
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setAllOrders(allOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        setSelectedOrder(updatedOrder);
      } else {
        console.error('Sipariş güncellenemedi');
      }
    } catch (error) {
      console.error('Sipariş güncellenirken hata:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAllOrders(prev => prev.filter(order => order.id !== orderId));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        console.error('Sipariş silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Sipariş silinirken hata:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      // New status format
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
      PROCESSING: { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-300', 
        icon: Package, 
        label: 'Hazırlanıyor' 
      },
      SHIPPED: { 
        bg: 'bg-indigo-100 dark:bg-indigo-900/30', 
        text: 'text-indigo-800 dark:text-indigo-300', 
        icon: Package, 
        label: 'Kargoya Verildi' 
      },
      DELIVERED: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        icon: CheckCircle, 
        label: 'Teslim Edildi' 
      },
      CANCELLED: { 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-300', 
        icon: XCircle, 
        label: 'İptal Edildi' 
      },
      // Legacy status support
      pending: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-300', 
        icon: Clock, 
        label: 'Bekliyor' 
      },
      completed: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-800 dark:text-green-300', 
        icon: CheckCircle, 
        label: 'Tamamlandı' 
      },
      cancelled: { 
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
    setSortOrder('desc');
  };
  
  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600 dark:text-gray-400">Siparişler yükleniyor...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <Package className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
          Sipariş Yönetimi
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredOrders.length} / {allOrders.length} sipariş
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
              placeholder="Sipariş ID, müşteri adı veya email ara..."
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
              <option value="PROCESSING">Hazırlanıyor</option>
              <option value="SHIPPED">Kargoya Verildi</option>
              <option value="DELIVERED">Teslim Edildi</option>
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
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
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
              <option value="total">Tutara Göre</option>
              <option value="customer">Müşteriye Göre</option>
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
            {filteredOrders.length} sipariş bulundu
          </div>
          {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>
      
      {/* Siparişler Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutar</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.user?.name || order.user?.adSoyad || 'Silinmiş Kullanıcı'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(order.total)} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detaylar
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        title="Siparişi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş Durum */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Arama kriterlerinize uygun sipariş bulunamadı.' 
                : 'Henüz sipariş bulunmuyor.'}
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

      {/* Sipariş Detay Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Sipariş Detayları - #{selectedOrder.id}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Sipariş Durumu</h6>
                  <div className="space-x-2 mb-4">
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        (selectedOrder.status === 'pending' || selectedOrder.status === 'PENDING')
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'PENDING')}
                      disabled={updating}
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      Bekliyor
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedOrder.status === 'CONFIRMED'
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'CONFIRMED')}
                      disabled={updating}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Onaylandı
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedOrder.status === 'PROCESSING'
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'PROCESSING')}
                      disabled={updating}
                    >
                      <Package className="w-4 h-4 inline mr-1" />
                      Hazırlanıyor
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        selectedOrder.status === 'SHIPPED'
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'SHIPPED')}
                      disabled={updating}
                    >
                      <Package className="w-4 h-4 inline mr-1" />
                      Kargoya Verildi
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        (selectedOrder.status === 'completed' || selectedOrder.status === 'DELIVERED')
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED')}
                      disabled={updating}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Teslim Edildi
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        (selectedOrder.status === 'cancelled' || selectedOrder.status === 'CANCELLED')
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                      onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}
                      disabled={updating}
                    >
                      <XCircle className="w-4 h-4 inline mr-1" />
                      İptal Edildi
                    </button>
                  </div>
                </div>

                <div>
                  <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Müşteri Bilgileri</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">İsim:</span> {selectedOrder.user?.name || selectedOrder.user?.adSoyad}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.user?.email}</div>
                    <div><span className="font-medium">Telefon:</span> {selectedOrder.phone || selectedOrder.user?.telefon || 'Belirtilmemiş'}</div>
                    <div><span className="font-medium">Adres:</span> {selectedOrder.address || selectedOrder.user?.adres || 'Belirtilmemiş'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Sipariş Ürünleri</h6>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ürün</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Birim Fiyat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adet</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Toplam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Puan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {(selectedOrder.items || selectedOrder.orderItems || []).map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{item.product?.name || 'Ürün'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatPrice(item.price)} ₺</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{formatPrice(item.price * item.quantity)} ₺</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.rating ? `${item.rating} / 5` : 'Puanlanmamış'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">Genel Toplam:</td>
                        <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100">{formatPrice(selectedOrder.total)} ₺</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 dark:bg-gray-500 text-base font-medium text-white hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                onClick={() => setSelectedOrder(null)}
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