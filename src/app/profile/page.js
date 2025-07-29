'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  User, Mail, Phone, MapPin, Calendar, Clock, Package, 
  Star, Edit3, Save, X, ShoppingBag, Settings, 
  CheckCircle, XCircle, AlertCircle, Eye, RefreshCw,
  CreditCard, Truck, Award
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
  const [activeTab, setActiveTab] = useState('profile');

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
      success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle },
      danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: XCircle },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: AlertCircle }
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
        <span className="ml-3 text-gray-600">Profil yükleniyor...</span>
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
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'profile', label: 'Profil Bilgileri', icon: User },
          { id: 'orders', label: 'Siparişlerim', icon: ShoppingBag },
          { id: 'appointments', label: 'Randevularım', icon: Calendar },
          { id: 'settings', label: 'Ayarlar', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Profil Bilgileri
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Ad Soyad</div>
                      <div className="font-medium">{user?.name || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">E-posta</div>
                      <div className="font-medium">{user?.email || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Telefon</div>
                      <div className="font-medium">{user?.phone || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Adres</div>
                      <div className="font-medium">{user?.address || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                  <div className="text-gray-600">Toplam Sipariş</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                  <div className="text-gray-600">Toplam Randevu</div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-gray-900">
                    {orders.reduce((total, order) => total + order.items.filter(item => item.rating).length, 0)}
                  </div>
                  <div className="text-gray-600">Puanlanan Ürün</div>
                </div>
              </div>

              {/* Son Aktiviteler */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Son Aktiviteler</h3>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="font-medium">Sipariş #{order.id}</div>
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(order.total)} ₺</div>
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
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                  Siparişlerim ({orders.length})
                </h2>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz sipariş yok</h3>
                  <p className="text-gray-500">İlk siparişinizi vermek için ürünlere göz atın.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Sipariş #{order.id}</h3>
                          <p className="text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{formatPrice(order.total)} ₺</div>
                          {getStatusBadge(order.status, 'order')}
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                                <p className="text-gray-500">
                                  {item.quantity} adet × {formatPrice(item.price)} ₺
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatPrice(item.quantity * item.price)} ₺</div>
                              <div className="mt-2">
                                {item.rating ? (
                                  <div className="flex items-center text-yellow-500">
                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                    <span className="text-sm font-medium">{item.rating}</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleRatingClick(item)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    Puanla
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

        {activeTab === 'appointments' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Randevularım ({appointments.length})
                </h2>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz randevu yok</h3>
                  <p className="text-gray-500">İlk randevunuzu almak için servislerimize göz atın.</p>
                </div>
              ) : (
                <div className="grid gap-6 p-6">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.serviceType}</h3>
                          <div className="flex items-center text-gray-500 mt-2 space-x-4">
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
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detaylar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointment.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{appointment.phone}</span>
                          </div>
                        )}
                        {appointment.address && (
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-700">{appointment.address}</span>
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

        {activeTab === 'settings' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Profil Ayarları
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Adresinizi girin"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Şifre değiştirmek için doldurun"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
}