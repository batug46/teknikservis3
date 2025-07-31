'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Search, SortAsc, SortDesc, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Package, User, Calendar, Filter, MoreVertical, Trash2
} from 'lucide-react';

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingData, setShippingData] = useState({
    courierCompany: '',
    trackingNumber: '',
    shippingAddress: '',
    shippingCost: 0,
    shippingInstructions: ''
  });
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });
  const [openDropdown, setOpenDropdown] = useState(null);

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 4000);
  };

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/returns');
      if (res.ok) {
        const data = await res.json();
        setReturns(data);
      } else {
        showFeedback('error', 'İade talepleri yüklenemedi');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showFeedback('error', 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Dropdown dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Filtreleme ve sıralama işlemi
  useEffect(() => {
    let filtered = [...returns];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(returnItem => 
        returnItem.orderItem.product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.user.adSoyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'user':
          comparison = (a.user.adSoyad || '').localeCompare(b.user.adSoyad || '');
          break;
        case 'product':
          comparison = (a.orderItem.product.name || '').localeCompare(b.orderItem.product.name || '');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredReturns(filtered);
  }, [returns, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchReturns();
        showFeedback('success', 'İade talebi durumu güncellendi');
      } else {
        showFeedback('error', 'Durum güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Status update error:', error);
      showFeedback('error', 'Bir hata oluştu');
    }
  };

  const handleShippingUpdate = async (returnId) => {
    try {
      console.log('Gönderilen kargo verileri:', shippingData);
      
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SHIPPING_REQUIRED',
          courierCompany: shippingData.courierCompany,
          trackingNumber: shippingData.trackingNumber,
          shippingAddress: shippingData.shippingAddress,
          shippingCost: shippingData.shippingCost,
          shippingInstructions: shippingData.shippingInstructions
        })
      });

             if (response.ok) {
         showFeedback('success', 'Kargo bilgileri güncellendi');
         setShowShippingModal(false);
         setSelectedReturn(null); // Detay modal'ını da kapat
         setShippingData({
           courierCompany: '',
           trackingNumber: '',
           shippingAddress: '',
           shippingCost: 0,
           shippingInstructions: ''
         });
         fetchReturns();
       } else {
        showFeedback('error', 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Shipping update error:', error);
      showFeedback('error', 'Bağlantı hatası');
    }
  };

  const handleDeleteReturn = async (returnId) => {
    if (!confirm('Bu iade talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showFeedback('success', 'İade talebi başarıyla silindi');
        fetchReturns();
      } else {
        showFeedback('error', 'İade talebi silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Delete return error:', error);
      showFeedback('error', 'Bağlantı hatası');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Beklemede' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Onaylandı' },
      SHIPPING_REQUIRED: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Package, label: 'Kargo Bekleniyor' },
      SHIPPED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, label: 'Kargolandı' },
      RECEIVED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: CheckCircle, label: 'Mağazada Alındı' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Reddedildi' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw, label: 'İşleniyor' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Tamamlandı' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'İptal Edildi' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const getAvailableActions = (returnItem) => {
    const actions = [];
    
    // Detay görüntüleme her zaman mevcut
    actions.push({
      label: 'Detayları Görüntüle',
      icon: Eye,
      onClick: () => setSelectedReturn(returnItem),
      className: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
    });

    // Duruma göre işlemler
    switch (returnItem.status) {
      case 'PENDING':
        actions.push(
          {
            label: 'Onayla',
            icon: CheckCircle,
            onClick: () => handleStatusUpdate(returnItem.id, 'APPROVED'),
            className: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
          },
          {
            label: 'Reddet',
            icon: XCircle,
            onClick: () => handleStatusUpdate(returnItem.id, 'REJECTED'),
            className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
          }
        );
        break;
      
      case 'APPROVED':
        actions.push({
          label: 'Kargo Bilgileri Ekle',
          icon: Package,
          onClick: () => {
            setSelectedReturn(returnItem);
            setShowShippingModal(true);
          },
          className: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        });
        break;
      
      case 'SHIPPING_REQUIRED':
        actions.push({
          label: 'Kargolandı Olarak İşaretle',
          icon: Package,
          onClick: () => handleStatusUpdate(returnItem.id, 'SHIPPED'),
          className: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30'
        });
        break;
      
      case 'SHIPPED':
        actions.push({
          label: 'Mağazada Alındı Olarak İşaretle',
          icon: CheckCircle,
          onClick: () => handleStatusUpdate(returnItem.id, 'RECEIVED'),
          className: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
        });
        break;
      
      case 'RECEIVED':
        actions.push({
          label: 'İade İşlemini Tamamla',
          icon: CheckCircle,
          onClick: () => handleStatusUpdate(returnItem.id, 'COMPLETED'),
          className: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
        });
        break;
    }

    // Silme butonu her durumda mevcut
    actions.push({
      label: 'İade Talebini Sil',
      icon: Trash2,
      onClick: () => handleDeleteReturn(returnItem.id),
      className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
    });
    
    return actions;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">İade talepleri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback.show && (
        <div className={`rounded-md p-4 ${
          feedback.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {feedback.type === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
          <RefreshCw className="w-8 h-8 mr-3 text-blue-600" />
          İade Talepleri Yönetimi
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredReturns.length} / {returns.length} talep
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Arama */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Ürün adı, müşteri adı veya neden ara..."
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
              <option value="PENDING">Beklemede</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="SHIPPING_REQUIRED">Kargo Bekleniyor</option>
              <option value="SHIPPED">Kargolandı</option>
              <option value="RECEIVED">Mağazada Alındı</option>
              <option value="REJECTED">Reddedildi</option>
              <option value="PROCESSING">İşleniyor</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>

          {/* Sıralama */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="date">Tarihe Göre</option>
              <option value="status">Duruma Göre</option>
              <option value="user">Müşteriye Göre</option>
              <option value="product">Ürüne Göre</option>
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

        {/* Temizle Butonu */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredReturns.length} talep bulundu
          </div>
          {(searchTerm || statusFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* İade Talepleri Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Neden</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {returnItem.user.adSoyad?.charAt(0) || 'U'}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {returnItem.user.adSoyad}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {returnItem.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {returnItem.orderItem.product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Sipariş #{returnItem.orderItem.order.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {returnItem.reason}
                    </div>
                    {returnItem.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {returnItem.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(returnItem.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(returnItem.createdAt)}
                  </td>
                                     <td className="px-6 py-4 text-sm font-medium">
                     <div className="relative dropdown-container">
                       <button
                         onClick={() => setOpenDropdown(openDropdown === returnItem.id ? null : returnItem.id)}
                         className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                       >
                         <MoreVertical className="w-4 h-4" />
                       </button>
                       
                       {openDropdown === returnItem.id && (
                         <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                           <div className="py-1" role="menu">
                             {getAvailableActions(returnItem).map((action, index) => {
                               const Icon = action.icon;
                               return (
                                 <button
                                   key={index}
                                   onClick={() => {
                                     action.onClick();
                                     setOpenDropdown(null);
                                   }}
                                   className={`${action.className} group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                                   role="menuitem"
                                 >
                                   <Icon className="w-4 h-4 mr-3" />
                                   {action.label}
                                 </button>
                               );
                             })}
                           </div>
                         </div>
                       )}
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş Durum */}
        {filteredReturns.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm || statusFilter !== 'all' 
                ? 'Arama kriterlerinize uygun iade talebi bulunamadı.' 
                : 'Henüz iade talebi bulunmuyor.'}
            </h3>
            {(searchTerm || statusFilter !== 'all') && (
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

             {/* Detay Modal */}
       {selectedReturn && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  İade Talebi Detayları
                </h3>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Müşteri Bilgileri</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Ad Soyad:</span> {selectedReturn.user.adSoyad}</p>
                      <p><span className="font-medium">E-posta:</span> {selectedReturn.user.email}</p>
                      <p><span className="font-medium">Telefon:</span> {selectedReturn.user.phone || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ürün Bilgileri</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Ürün:</span> {selectedReturn.orderItem.product.name}</p>
                      <p><span className="font-medium">Sipariş No:</span> #{selectedReturn.orderItem.order.id}</p>
                      <p><span className="font-medium">Miktar:</span> {selectedReturn.orderItem.quantity} adet</p>
                      <p><span className="font-medium">Fiyat:</span> {selectedReturn.orderItem.price} ₺</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">İade Bilgileri</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Neden:</span> {selectedReturn.reason}</p>
                    <p><span className="font-medium">Tür:</span> {
                      selectedReturn.returnType === 'REFUND' ? 'Para İadesi' : 
                      selectedReturn.returnType === 'EXCHANGE' ? 'Ürün Değişimi' : 'Kredi'
                    }</p>
                    <p><span className="font-medium">Durum:</span> {getStatusBadge(selectedReturn.status)}</p>
                    <p><span className="font-medium">Tarih:</span> {formatDate(selectedReturn.createdAt)}</p>
                    {selectedReturn.description && (
                      <p><span className="font-medium">Açıklama:</span> {selectedReturn.description}</p>
                    )}
                  </div>
                </div>

                {selectedReturn.adminNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Admin Notu</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedReturn.adminNotes}</p>
                  </div>
                )}

                {/* Kargo Bilgileri */}
                {(selectedReturn.status === 'SHIPPING_REQUIRED' || selectedReturn.status === 'SHIPPED' || selectedReturn.status === 'RECEIVED') && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Kargo Bilgileri</h4>
                    <div className="space-y-2">
                      {selectedReturn.courierCompany && (
                        <p><span className="font-medium">Kargo Firması:</span> {selectedReturn.courierCompany}</p>
                      )}
                      {selectedReturn.trackingNumber && (
                        <p><span className="font-medium">Takip No:</span> {selectedReturn.trackingNumber}</p>
                      )}
                      {selectedReturn.shippingAddress && (
                        <p><span className="font-medium">Gönderim Adresi:</span> {selectedReturn.shippingAddress}</p>
                      )}
                      {selectedReturn.shippingCost !== null && (
                        <p><span className="font-medium">Kargo Ücreti:</span> {
                          selectedReturn.shippingCost === 0 ? 'Ücretsiz' : `${selectedReturn.shippingCost} ₺`
                        }</p>
                      )}
                      {selectedReturn.shippingInstructions && (
                        <p><span className="font-medium">Kargo Talimatları:</span> {selectedReturn.shippingInstructions}</p>
                      )}
                      {selectedReturn.shippedAt && (
                        <p><span className="font-medium">Kargolandığı Tarih:</span> {formatDate(selectedReturn.shippedAt)}</p>
                      )}
                      {selectedReturn.receivedAt && (
                        <p><span className="font-medium">Mağazada Alındığı Tarih:</span> {formatDate(selectedReturn.receivedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Kargo Bilgileri Modal */}
       {showShippingModal && selectedReturn && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Kargo Bilgileri Ekle
                </h3>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kargo Firması
                  </label>
                  <select
                    value={shippingData.courierCompany}
                    onChange={(e) => setShippingData({...shippingData, courierCompany: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Kargo firması seçin</option>
                    <option value="MNG Kargo">MNG Kargo</option>
                    <option value="Yurtiçi Kargo">Yurtiçi Kargo</option>
                    <option value="Aras Kargo">Aras Kargo</option>
                    <option value="PTT Kargo">PTT Kargo</option>
                    <option value="UPS Kargo">UPS Kargo</option>
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Takip Numarası
                  </label>
                  <input
                    type="text"
                    value={shippingData.trackingNumber}
                    onChange={(e) => setShippingData({...shippingData, trackingNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Kargo takip numarası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gönderim Adresi
                  </label>
                  <textarea
                    value={shippingData.shippingAddress}
                    onChange={(e) => setShippingData({...shippingData, shippingAddress: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Mağaza adresi ve iletişim bilgileri"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kargo Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingData.shippingCost}
                    onChange={(e) => setShippingData({...shippingData, shippingCost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0 (ücretsiz için)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kargo Talimatları
                  </label>
                  <textarea
                    value={shippingData.shippingInstructions}
                    onChange={(e) => setShippingData({...shippingData, shippingInstructions: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Müşteriye verilecek kargo talimatları..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowShippingModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => handleShippingUpdate(selectedReturn.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Kargo Bilgilerini Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 