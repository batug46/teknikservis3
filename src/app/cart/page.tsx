'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Tarayıcı hafızasından sepeti ve kullanıcı bilgisini yükle
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    setUser(JSON.parse(localStorage.getItem('user') || 'null'));
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    // Sepeti hem state'te hem de localStorage'da güncelle
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    // Navbar gibi diğer bileşenleri güncellemek için storage event'i tetikle
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuantityChange = (productId: number, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        // Miktar 0'dan küçük veya stoktan fazla olamaz
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }).filter(item => item.quantity > 0); // Miktarı 0 olanları sepetten çıkar

    updateCart(newCart);
  };

  const handleRemoveItem = (productId: number) => {
    const newCart = cart.filter(item => item.id !== productId);
    updateCart(newCart);
  };
  
  const handleCompletePurchase = async () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Token'ı ekliyoruz
        },
        body: JSON.stringify({ cartItems: cart }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sipariş oluşturulamadı.');
      
      setMessage('Siparişiniz başarıyla oluşturuldu! Profil sayfanıza yönlendiriliyorsunuz...');
      updateCart([]); // Sepeti temizle
      setTimeout(() => router.push('/profile'), 3000);

    } catch (err: any) {
      setMessage(err.message);
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container my-5">
      <h2>Sepetim</h2>
      {cart.length === 0 ? (
        <div className="alert alert-info mt-4">
          Sepetiniz boş. <Link href="/products">Ürünlere göz atın.</Link>
        </div>
      ) : (
        <div className="row mt-4">
          <div className="col-lg-8">
            {cart.map(item => (
              <div key={item.id} className="card mb-3">
                <div className="row g-0 align-items-center">
                  <div className="col-md-2">
                    <img src={item.imageUrl || 'https://placehold.co/150x150'} alt={item.name} className="img-fluid rounded-start p-2" />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <div className="d-flex align-items-center mt-2">
                          <button onClick={() => handleQuantityChange(item.id, -1)} className="btn btn-outline-secondary btn-sm" style={{ width: '30px' }}>-</button>
                          <span className="mx-3 fw-bold">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)} className="btn btn-outline-secondary btn-sm" style={{ width: '30px' }}>+</button>
                          {/* İkon yerine metin tabanlı bir buton eklendi */}
                          <button onClick={() => handleRemoveItem(item.id)} className="btn btn-link text-danger btn-sm ms-3">
                            Kaldır
                          </button>
                       </div>
                    </div>
                  </div>
                  <div className="col-md-3 text-end p-3">
                     {/* Toplam Fiyat */}
                     <strong>{(item.price * item.quantity).toFixed(2)} TL</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sipariş Özeti</h5>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Ara Toplam</span>
                  <span>{totalPrice.toFixed(2)} TL</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <strong>Genel Toplam</strong>
                  <strong>{totalPrice.toFixed(2)} TL</strong>
                </div>
                <hr/>
                {message && <div className="alert alert-info">{message}</div>}
                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleCompletePurchase}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'İşleniyor...' : 'Alışverişi Tamamla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
