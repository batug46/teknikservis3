'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, ShoppingBag, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stockInfo, setStockInfo] = useState({});
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
    
    // Stok bilgilerini getir
    const fetchStockInfo = async () => {
      try {
        const productIds = cartData.map(item => item.id);
        if (productIds.length === 0) return;
        
        const res = await fetch('/api/admin/products');
        const products = await res.json();
        
        const stockData = {};
        products.forEach(product => {
          stockData[product.id] = product.stock;
        });
        
        setStockInfo(stockData);
      } catch (error) {
        console.error('Stok bilgileri alınamadı:', error);
      }
    };

    fetchStockInfo();
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Stok kontrolü
    const availableStock = stockInfo[productId];
    if (availableStock !== undefined && newQuantity > availableStock) {
      setMessage({ 
        type: 'warning', 
        text: `Üzgünüz, bu ürün için yalnızca ${availableStock} adet stok mevcut.` 
      });
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newCart);
    setMessage({ type: '', text: '' });
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
  };

  const handleCompletePurchase = async () => {
    if (status !== 'authenticated') {
      router.push('/login?redirect=/cart');
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          // Stok hatası detaylarını göster
          throw new Error(data.details.join('\n'));
        }
        throw new Error(data.error || 'Sipariş oluşturulamadı.');
      }
      
      // Sepeti temizle
      updateCart([]);
      
      // Başarı sayfasına yönlendir
      router.push(`/order-success?orderId=${data.id}`);

    } catch (err) {
      setMessage({ type: 'danger', text: err.message });
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Güvenli fiyat formatı
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Message Alert Component
  const MessageAlert = ({ message }) => {
    if (!message.text) return null;

    const alertConfig = {
      warning: { 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
        border: 'border-yellow-200 dark:border-yellow-800', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        icon: AlertTriangle 
      },
      danger: { 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        border: 'border-red-200 dark:border-red-800', 
        text: 'text-red-800 dark:text-red-200', 
        icon: AlertTriangle 
      },
      success: { 
        bg: 'bg-green-50 dark:bg-green-900/20', 
        border: 'border-green-200 dark:border-green-800', 
        text: 'text-green-800 dark:text-green-200', 
        icon: CheckCircle 
      }
    };

    const config = alertConfig[message.type] || alertConfig.warning;
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 ${config.text} mr-3 mt-0.5`} />
          <div className={config.text}>
            {message.text.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-12">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sepetiniz Boş</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Henüz sepetinizde ürün bulunmamaktadır. Alışverişe başlamak için ürünlerimize göz atın.
          </p>
          <Link 
            href="/products"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Package className="w-5 h-5 mr-2" />
            Ürünleri İncele
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ShoppingCart className="w-8 h-8 mr-3 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Sepetim</h1>
          <span className="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
            {cart.length} ürün
          </span>
        </div>
        <Link 
          href="/products"
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Alışverişe Devam Et
        </Link>
      </div>

      <MessageAlert message={message} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sepet Ürünleri</h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{formatPrice(item.price)} ₺</p>
                      {stockInfo[item.id] !== undefined && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          Stokta: {stockInfo[item.id]} adet
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      
                      <span className="w-12 text-center font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                      
                      <button
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={stockInfo[item.id] !== undefined && item.quantity >= stockInfo[item.id]}
                      >
                        <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)} ₺
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      onClick={() => removeFromCart(item.id)}
                      title="Sepetten Kaldır"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Sipariş Özeti</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Ara Toplam ({cart.length} ürün)</span>
                <span>{formatPrice(totalPrice)} ₺</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Kargo</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Ücretsiz</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                <span>Toplam</span>
                <span>{formatPrice(totalPrice)} ₺</span>
              </div>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCompletePurchase}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-3" />
                  Alışverişi Tamamla
                </>
              )}
            </button>

            {status !== 'authenticated' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                Alışverişi tamamlamak için giriş yapmanız gerekiyor.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 