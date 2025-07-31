'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Package, 
  Star, Edit3, Save, X, ShoppingBag, Settings, 
  CheckCircle, XCircle, AlertCircle, Eye, RefreshCw,
  CreditCard, Truck, Award, Heart
} from 'lucide-react';

// Sayfayı dinamik olarak işaretle
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState('0');
  const [likedProducts, setLikedProducts] = useState([]);
  const [likedProductsLoading, setLikedProductsLoading] = useState(true);
  const [returns, setReturns] = useState([]);
  const [returnsLoading, setReturnsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // İade modal state'leri
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnType, setReturnType] = useState('REFUND');

  // Profil güncelleme state'leri
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Siparişleri getir
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/profile/orders', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    }
  }, []);

  // Randevuları getir
  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch('/api/profile/appointments', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
    }
  }, []);

  const fetchLikedProducts = useCallback(async () => {
    try {
      setLikedProductsLoading(true);
      const response = await fetch('/api/profile/liked-products');
      if (response.ok) {
        const data = await response.json();
        setLikedProducts(data);
      }
    } catch (error) {
      console.error('Beğenilen ürünler yüklenirken hata:', error);
    } finally {
      setLikedProductsLoading(false);
    }
  }, []);

  const fetchReturns = useCallback(async () => {
    try {
      setReturnsLoading(true);
      const response = await fetch('/api/profile/returns');
      if (response.ok) {
        const data = await response.json();
        setReturns(data);
      }
    } catch (error) {
      console.error('İade talepleri yüklenirken hata:', error);
    } finally {
      setReturnsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Profil bilgilerini getir
      const fetchProfile = async () => {
        try {
          const response = await fetch('/api/auth/profile');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setName(userData.name || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Profil bilgileri alınırken hata:', error);
          router.push('/login');
        }
      };

      // İç fetch fonksiyonu (loading state ile)
      const fetchInitialAppointments = async () => {
        try {
          const response = await fetch('/api/profile/appointments', { cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            setAppointments(data);
          }
        } catch (error) {
          console.error('Randevular yüklenirken hata:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
      fetchOrders();
      fetchInitialAppointments();
      fetchLikedProducts();
      fetchReturns();

      // Sayfa visibility değiştiğinde veriyi yenile
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchOrders();
          fetchAppointments();
        }
      };

      // Hem focus hem de visibility change olaylarını dinle
      window.addEventListener('focus', handleVisibilityChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('focus', handleVisibilityChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [status, session, router, fetchOrders, fetchAppointments]);

  // Sayfa her ziyaret edildiğinde veriyi yenile
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchOrders();
      fetchAppointments();
    }
  }, [pathname, fetchOrders, fetchAppointments, status, session]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prevUser => ({ ...prevUser, name, email, phone, address }));
        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi.' });
        
        // Şifre alanlarını temizle
        setCurrentPassword('');
        setNewPassword('');

        // Email değiştiğinde oturumu yenile
        if (email !== session?.user?.email) {
          setMessage({ type: 'success', text: 'Email adresiniz güncellendi. Yeniden giriş yapmanız gerekiyor.' });
          setTimeout(async () => {
            await signOut({ redirect: true, callbackUrl: '/login' });
          }, 2000);
        }
      } else {
        setMessage({ type: 'danger', text: data.error || 'Bir hata oluştu.' });
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setMessage({ type: 'danger', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    }
  };

  const handleRatingClick = (item) => {
    setSelectedItem(item);
    setRating('0');
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (rating === '0') {
      return;
    }

    try {
      const response = await fetch(`/api/order-items/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: parseInt(rating) }),
      });

      if (response.ok) {
        setShowRatingModal(false);
        setSelectedItem(null);
        setRating('0');

        // Siparişleri yeniden yükle
        const ordersRes = await fetch('/api/profile/orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
          
          if (selectedOrder) {
            const updatedOrder = ordersData.find(o => o.id === selectedOrder.id);
            if (updatedOrder) {
              setSelectedOrder(updatedOrder);
            }
          }
        }
      }
    } catch (error) {
      console.error('Puanlama sırasında hata:', error);
    }
  };

  // İade durumunu kontrol et
  const getReturnStatusForItem = (orderItemId) => {
    const returnItem = returns.find(r => r.orderItemId === orderItemId);
    return returnItem ? returnItem.status : null;
  };

  // İade butonunu göster/gizle
  const canCreateReturn = (orderItemId) => {
    const status = getReturnStatusForItem(orderItemId);
    return !status || status === 'REJECTED' || status === 'CANCELLED';
  };

  // İade modal'ını aç
  const handleReturnClick = (orderItem) => {
    setSelectedReturnItem(orderItem);
    setReturnReason('');
    setReturnDescription('');
    setReturnType('REFUND');
    setShowReturnModal(true);
  };

  // İade modal'ını kapat
  const handleCloseReturnModal = () => {
    setShowReturnModal(false);
    setSelectedReturnItem(null);
    setReturnReason('');
    setReturnDescription('');
    setReturnType('REFUND');
  };

  const handleCreateReturn = async (orderItem) => {
    try {
      const response = await fetch('/api/profile/returns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItemId: orderItem.id,
          reason: returnReason,
          description: returnDescription,
          returnType: returnType
        })
      });

      if (response.ok) {
        fetchReturns();
        setMessage({ type: 'success', text: 'İade talebiniz başarıyla oluşturuldu!' });
        handleCloseReturnModal();
      } else {
        const error = await response.json();
        setMessage({ type: 'danger', text: error.error || 'İade talebi oluşturulamadı' });
      }
    } catch (error) {
      console.error('İade talebi oluşturma hatası:', error);
      setMessage({ type: 'danger', text: 'Bir hata oluştu' });
    }
  };

  // Sipariş iptal state'leri
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);
  const [selectedCancelItem, setSelectedCancelItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDescription, setCancelDescription] = useState('');

  const handleCancelClick = (order, item = null) => {
    setSelectedCancelOrder(order);
    setSelectedCancelItem(item);
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedCancelOrder(null);
    setSelectedCancelItem(null);
    setCancelReason('');
    setCancelDescription('');
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      setMessage({ type: 'danger', text: 'Lütfen iptal nedenini seçin' });
      return;
    }

    try {
      let response;
      if (selectedCancelItem) {
        // Ürün bazlı iptal
        response = await fetch(`/api/orders/${selectedCancelOrder.id}/items/${selectedCancelItem.id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: cancelReason,
            description: cancelDescription
          })
        });
      } else {
        // Sipariş bazlı iptal
        response = await fetch(`/api/orders/${selectedCancelOrder.id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: cancelReason,
            description: cancelDescription
          })
        });
      }

      if (response.ok) {
        const result = await response.json();
        handleCloseCancelModal();
        fetchOrders();
        if (selectedCancelItem) {
          setMessage({ type: 'success', text: 'Ürün başarıyla iptal edildi' });
        } else {
          setMessage({ type: 'success', text: 'Sipariş başarıyla iptal edildi' });
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'danger', text: error.error || 'İptal işlemi sırasında hata oluştu' });
      }
    } catch (error) {
      console.error('İptal hatası:', error);
      setMessage({ type: 'danger', text: 'Bağlantı hatası' });
    }
  };

  const canCancelOrder = (order) => {
    return order.status === 'PENDING' || order.status === 'CONFIRMED';
  };

  const canCancelItem = (item, orderStatus) => {
    return item.status !== 'CANCELLED' && (orderStatus === 'PENDING' || orderStatus === 'CONFIRMED');
  };

  // Helper functions
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status, type = 'order') => {
    const statusConfigs = {
      order: {
        // Yeni status'ler (admin panelindeki gibi)
        PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Bekliyor' },
        CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle, label: 'Onaylandı' },
        PROCESSING: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package, label: 'Hazırlanıyor' },
        SHIPPED: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Package, label: 'Kargoda' },
        DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Teslim Edildi' },
        CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'İptal Edildi' },
        // Eski status'ler (legacy destek)
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Bekliyor' },
        completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Tamamlandı' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'İptal Edildi' }
      },
      appointment: {
        PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Bekliyor' },
        CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Onaylandı' },
        IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw, label: 'Devam Ediyor' },
        CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'İptal Edildi' }
      },
      return: {
        PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', icon: Clock, label: 'İade Talebi Beklemede' },
        APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', icon: CheckCircle, label: 'İade Talebi Onaylandı' },
        SHIPPING_REQUIRED: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', icon: Package, label: 'Kargo Bekleniyor' },
        SHIPPED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', icon: Package, label: 'Kargolandı' },
        RECEIVED: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200', icon: CheckCircle, label: 'Mağazada Alındı' },
        REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', icon: XCircle, label: 'İade Talebi Reddedildi' },
        PROCESSING: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', icon: RefreshCw, label: 'İade İşleniyor' },
        COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', icon: CheckCircle, label: 'İade Tamamlandı' },
        CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-200', icon: XCircle, label: 'İade İptal Edildi' }
      }
    };

    const config = statusConfigs[type][status] || statusConfigs[type].PENDING || statusConfigs[type].pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const MessageAlert = ({ message }) => {
    if (!message.text) return null;

    const alertConfig = {
      success: { 
        bg: 'bg-green-50 dark:bg-green-900/20', 
        border: 'border-green-200 dark:border-green-800', 
        text: 'text-green-800 dark:text-green-200', 
        icon: CheckCircle 
      },
      danger: { 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        border: 'border-red-200 dark:border-red-800', 
        text: 'text-red-800 dark:text-red-200', 
        icon: XCircle 
      },
      warning: { 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
        border: 'border-yellow-200 dark:border-yellow-800', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        icon: AlertCircle 
      }
    };

    const config = alertConfig[message.type] || alertConfig.warning;
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 ${config.text} mr-3 mt-0.5`} />
          <div className={config.text}>{message.text}</div>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Profil yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name || 'Kullanıcı'}</h1>
            <p className="text-blue-100 flex items-center mt-2">
              <Mail className="w-4 h-4 mr-2" />
              {user?.email}
            </p>
            <div className="flex space-x-4 mt-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {orders.length} Sipariş
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {appointments.length} Randevu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'profile', label: 'Profil Bilgileri', icon: User },
          { id: 'orders', label: 'Siparişlerim', icon: ShoppingBag },
          { id: 'returns', label: 'Taleplerim', icon: RefreshCw },
          { id: 'appointments', label: 'Randevularım', icon: Calendar },
          { id: 'liked', label: 'Beğendiklerim', icon: Heart },
          { id: 'settings', label: 'Ayarlar', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <MessageAlert message={message} />

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'profile' && (
          <>
            {/* Profil Bilgileri */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Profil Bilgileri
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Ad Soyad</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user?.name || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">E-posta</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user?.email || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Telefon</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user?.phone || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Adres</div>
                      <div className="font-medium text-gray-900 dark:text-white">{user?.address || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</div>
                  <div className="text-gray-600 dark:text-gray-300">Toplam Sipariş</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                  <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{appointments.length}</div>
                  <div className="text-gray-600 dark:text-gray-300">Toplam Randevu</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                  <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.reduce((total, order) => total + order.items.filter(item => item.rating).length, 0)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Puanlanan Ürün</div>
                </div>
              </div>

              {/* Son Aktiviteler */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Son Aktiviteler</h3>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Sipariş #{order.id}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)} ₺</div>
                        {getStatusBadge(order.status, 'order')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                  Siparişlerim ({orders.length})
                </h2>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz sipariş yok</h3>
                  <p className="text-gray-500 dark:text-gray-400">İlk siparişinizi vermek için ürünlere göz atın.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sipariş #{order.id}</h3>
                          <p className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(order.total)} ₺</div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(order.status, 'order')}
                            {canCancelOrder(order) && (
                              <button
                                onClick={() => handleCancelClick(order)}
                                className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                İptal Et
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{item.product.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                  {item.quantity} adet × {formatPrice(item.price)} ₺
                                </p>
                                {item.status === 'CANCELLED' && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      İptal Edildi
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.quantity * item.price)} ₺</div>
                              <div className="mt-2 flex flex-col space-y-2">
                                {item.rating ? (
                                  <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                    <span className="text-sm font-medium">{item.rating}</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleRatingClick(item)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium text-left"
                                  >
                                    Puanla
                                  </button>
                                )}
                                {canCreateReturn(item.id) ? (
                                  <button
                                    onClick={() => handleReturnClick(item)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium text-left"
                                  >
                                    İade Talebi
                                  </button>
                                ) : (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {getStatusBadge(getReturnStatusForItem(item.id), 'return')}
                                  </div>
                                )}
                                {canCancelItem(item, order.status) && (
                                  <button
                                    onClick={() => handleCancelClick(order, item)}
                                    className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium text-left"
                                  >
                                    Ürünü İptal Et
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                  İade Taleplerim ({returns.length})
                </h2>
              </div>
              
              {returnsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">İade talepleri yükleniyor...</p>
                </div>
              ) : returns.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz iade talebiniz yok</h3>
                  <p className="text-gray-500 dark:text-gray-400">Satın aldığınız ürünler için iade talebi oluşturabilirsiniz.</p>
                </div>
              ) : (
                <div className="grid gap-6 p-6">
                  {returns.map((returnItem) => (
                    <div key={returnItem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {returnItem.orderItem.product.name}
                          </h3>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(returnItem.createdAt)}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              Sipariş #{returnItem.orderItem.order.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(returnItem.status, 'return')}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">İade Nedeni</h4>
                          <p className="text-gray-700 dark:text-gray-300">{returnItem.reason}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">İade Türü</h4>
                          <p className="text-gray-700 dark:text-gray-300">
                            {returnItem.returnType === 'REFUND' ? 'Para İadesi' : 
                             returnItem.returnType === 'EXCHANGE' ? 'Ürün Değişimi' : 'Kredi'}
                          </p>
                        </div>
                      </div>

                      {returnItem.description && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Açıklama</h4>
                          <p className="text-gray-700 dark:text-gray-300">{returnItem.description}</p>
                        </div>
                      )}

                      {returnItem.adminNotes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Admin Notu</h4>
                          <p className="text-blue-800 dark:text-blue-200">{returnItem.adminNotes}</p>
                        </div>
                      )}

                      {/* Kargo Bilgileri */}
                      {(returnItem.status === 'SHIPPING_REQUIRED' || returnItem.status === 'SHIPPED' || returnItem.status === 'RECEIVED') && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                          <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                            <Truck className="w-4 h-4 mr-2" />
                            Kargo Bilgileri
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {returnItem.courierCompany && (
                              <div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Kargo Firması:</span>
                                <p className="text-green-700 dark:text-green-300">{returnItem.courierCompany}</p>
                              </div>
                            )}
                            {returnItem.trackingNumber && (
                              <div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Takip Numarası:</span>
                                <p className="text-green-700 dark:text-green-300">{returnItem.trackingNumber}</p>
                              </div>
                            )}
                            {returnItem.shippingAddress && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Gönderim Adresi:</span>
                                <p className="text-green-700 dark:text-green-300">{returnItem.shippingAddress}</p>
                              </div>
                            )}
                            {returnItem.shippingCost !== null && (
                              <div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Kargo Ücreti:</span>
                                <p className="text-green-700 dark:text-green-300">
                                  {returnItem.shippingCost === 0 ? 'Ücretsiz' : `${returnItem.shippingCost} ₺`}
                                </p>
                              </div>
                            )}
                            {returnItem.shippingInstructions && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Kargo Talimatları:</span>
                                <p className="text-green-700 dark:text-green-300">{returnItem.shippingInstructions}</p>
                              </div>
                            )}
                            {returnItem.shippedAt && (
                              <div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Kargolandığı Tarih:</span>
                                <p className="text-green-700 dark:text-green-300">{formatDate(returnItem.shippedAt)}</p>
                              </div>
                            )}
                            {returnItem.receivedAt && (
                              <div>
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">Mağazada Alındığı Tarih:</span>
                                <p className="text-green-700 dark:text-green-300">{formatDate(returnItem.receivedAt)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Randevularım ({appointments.length})
                </h2>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz randevu yok</h3>
                  <p className="text-gray-500 dark:text-gray-400">İlk randevunuzu almak için servislerimize göz atın.</p>
                </div>
              ) : (
                <div className="grid gap-6 p-6">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.serviceType}</h3>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(appointment.date)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(appointment.status, 'appointment')}
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detaylar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointment.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">{appointment.phone}</span>
                          </div>
                        )}
                        {appointment.address && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{appointment.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Beğendiğim Ürünler ({likedProducts.length})
                </h2>
              </div>
              
              {likedProductsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Beğenilen ürünler yükleniyor...</p>
                </div>
              ) : likedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz beğendiğiniz ürün yok</h3>
                  <p className="text-gray-500">Ürünleri beğenmek için ürün sayfalarını ziyaret edin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                  {likedProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-9 mb-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)} ₺</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.stock > 0 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          }`}>
                            {product.stock > 0 ? `Stokta (${product.stock})` : 'Stokta Yok'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex-1 bg-blue-600 text-white py-1.5 px-3 rounded-lg text-center text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            İncele
                          </Link>
                          <button
                            onClick={() => {
                              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                              const existingItem = cart.find(item => item.id === product.id);
                              if (existingItem) {
                                existingItem.quantity += 1;
                              } else {
                                cart.push({ ...product, quantity: 1 });
                              }
                              localStorage.setItem('cart', JSON.stringify(cart));
                              window.dispatchEvent(new Event('storage'));
                              alert('Ürün sepete eklendi!');
                            }}
                            disabled={product.stock <= 0}
                            className="flex-1 bg-green-600 text-white py-1.5 px-3 rounded-lg text-center text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Profil Ayarları
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefon</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adres</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-24 resize-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Adresinizi girin"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Şifre Değiştir</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mevcut Şifre</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Şifre değiştirmek için doldurun"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yeni şifrenizi girin"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Bilgileri Güncelle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ürün Puanlama</h3>
                <button 
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  <strong>{selectedItem.product.name}</strong> için puanınızı verin:
                </p>
                
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value.toString())}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                        rating === value.toString()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleRatingSubmit}
                  disabled={rating === '0'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Puanla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {formatDate(selectedAppointment.date)} - {selectedAppointment.time}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Randevu Durumu */}
                <div>
                  <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">RANDEVU DURUMU</h6>
                  <div className="inline-block">
                    {getStatusBadge(selectedAppointment.status, 'appointment')}
                  </div>
                </div>

                {/* Müşteri Bilgileri */}
                <div>
                  <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">MÜŞTERİ BİLGİLERİ</h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">İsim:</span> {selectedAppointment.user?.name || user?.name || 'Belirtilmemiş'}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span> {selectedAppointment.user?.email || user?.email || 'Belirtilmemiş'}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Telefon:</span> {selectedAppointment.phone || user?.phone || 'Belirtilmemiş'}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Adres:</span> {selectedAppointment.address || user?.address || 'Belirtilmemiş'}</div>
                  </div>
                </div>

                {/* Randevu Bilgileri */}
                <div>
                  <h6 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">RANDEVU BİLGİLERİ</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Hizmet:</span> {selectedAppointment.serviceType}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Özel Notlar:</span> {selectedAppointment.description || 'Belirtilmemiş'}</div>
                    <div><span className="font-semibold text-gray-700 dark:text-gray-300">Fiyat:</span> {selectedAppointment.price && selectedAppointment.price > 0 ? `${selectedAppointment.price} ₺` : 'Belirtilmemiş'}</div>
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

      {/* İade Talebi Modal */}
      {showReturnModal && selectedReturnItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  İade Talebi Oluştur
                </h3>
                <button
                  onClick={handleCloseReturnModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Ürün Bilgileri */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ürün Bilgileri</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{selectedReturnItem.product.name}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedReturnItem.quantity} adet × {formatPrice(selectedReturnItem.price)} ₺
                      </p>
                    </div>
                  </div>
                </div>

                {/* İade Nedeni */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İade Nedeni *
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">İade nedenini seçin</option>
                    <option value="Ürün hasarlı geldi">Ürün hasarlı geldi</option>
                    <option value="Ürün beklentilerimi karşılamadı">Ürün beklentilerimi karşılamadı</option>
                    <option value="Yanlış ürün gönderildi">Yanlış ürün gönderildi</option>
                    <option value="Ürün çalışmıyor">Ürün çalışmıyor</option>
                    <option value="Boyut/renk uygun değil">Boyut/renk uygun değil</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                {/* İade Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İade Türü *
                  </label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="REFUND">Para İadesi</option>
                    <option value="EXCHANGE">Ürün Değişimi</option>
                    <option value="CREDIT">Kredi</option>
                  </select>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={returnDescription}
                    onChange={(e) => setReturnDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="İade talebiniz hakkında detaylı bilgi verebilirsiniz..."
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6">
              <button
                type="button"
                onClick={() => handleCreateReturn(selectedReturnItem)}
                disabled={!returnReason || !returnType}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                İade Talebi Oluştur
              </button>
              <button
                type="button"
                onClick={handleCloseReturnModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sipariş İptal Modal */}
      {showCancelModal && selectedCancelOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedCancelItem ? 'Ürün İptal Et' : 'Sipariş İptal Et'}
                </h3>
                <button
                  onClick={handleCloseCancelModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Sipariş Bilgileri */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedCancelItem ? 'Ürün Bilgileri' : 'Sipariş Bilgileri'}
                  </h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Sipariş No:</span> #{selectedCancelOrder.id}</p>
                    {selectedCancelItem ? (
                      <>
                        <p><span className="font-medium">Ürün:</span> {selectedCancelItem.product.name}</p>
                        <p><span className="font-medium">Adet:</span> {selectedCancelItem.quantity}</p>
                        <p><span className="font-medium">Birim Fiyat:</span> {formatPrice(selectedCancelItem.price)} ₺</p>
                        <p><span className="font-medium">Toplam:</span> {formatPrice(selectedCancelItem.quantity * selectedCancelItem.price)} ₺</p>
                      </>
                    ) : (
                      <>
                        <p><span className="font-medium">Toplam Tutar:</span> {formatPrice(selectedCancelOrder.total)} ₺</p>
                        <p><span className="font-medium">Durum:</span> {getStatusBadge(selectedCancelOrder.status, 'order')}</p>
                      </>
                    )}
                    <p><span className="font-medium">Tarih:</span> {formatDate(selectedCancelOrder.createdAt)}</p>
                  </div>
                </div>

                {/* İptal Nedeni */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İptal Nedeni *
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">İptal nedenini seçin</option>
                    <option value="Yanlış ürün seçtim">Yanlış ürün seçtim</option>
                    <option value="Fiyat değişti">Fiyat değişti</option>
                    <option value="Başka yerden aldım">Başka yerden aldım</option>
                    <option value="İhtiyacım kalmadı">İhtiyacım kalmadı</option>
                    <option value="Teslimat süresi uzun">Teslimat süresi uzun</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={cancelDescription}
                    onChange={(e) => setCancelDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="İptal talebiniz hakkında detaylı bilgi verebilirsiniz..."
                  />
                </div>

                {/* Uyarı */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Dikkat
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          {selectedCancelItem 
                            ? 'Ürün iptal işlemi geri alınamaz. İptal etmek istediğinizden emin misiniz?' 
                            : 'Sipariş iptal işlemi geri alınamaz. İptal etmek istediğinizden emin misiniz?'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-6">
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={!cancelReason}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                {selectedCancelItem ? 'Ürünü İptal Et' : 'Siparişi İptal Et'}
              </button>
              <button
                type="button"
                onClick={handleCloseCancelModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}