'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: number; name: string; price: number; quantity: number; stock: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuantityChange = (productId: number, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0 && newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
      }
      return item;
    }).filter(item => item.quantity > 0);
    updateCart(newCart);
  };

  const handleRemoveItem = (productId: number) => {
    updateCart(cart.filter(item => item.id !== productId));
  };

  const handleCompletePurchase = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
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
      if (!res.ok) throw new Error(data.error || 'Sipariş oluşturulamadı.');
      
      setMessage({ type: 'success', text: 'Siparişiniz başarıyla oluşturuldu!' });
      updateCart([]);

    } catch (err: any) {
      setMessage({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container my-5">
      <h2>Sepetim</h2>
      {message.text && <div className={`alert alert-${message.type} mt-3`}>{message.text}</div>}
      
      {cart.length === 0 ? (
        message.type !== 'success' && <div className="alert alert-info mt-4">Sepetiniz boş. <Link href="/products">Ürünlere göz atın.</Link></div>
      ) : (
        <div className="row mt-4">
          <div className="col-lg-8">
            {cart.map(item => (
              <div key={item.id} className="card mb-3">
                <div className="row g-0 align-items-center p-2">
                  <div className="col-md-8">
                    <h5 className="card-title mb-1">{item.name}</h5>
                    <small className="text-muted">Birim Fiyat: {item.price.toFixed(2)} TL</small>
                    <div className="d-flex align-items-center mt-2">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="btn btn-outline-secondary btn-sm" disabled={item.quantity <= 1}>-</button>
                      <span className="mx-3 fw-bold">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="btn btn-outline-secondary btn-sm" disabled={item.quantity >= item.stock}>+</button>
                      <button onClick={() => handleRemoveItem(item.id)} className="btn btn-link text-danger btn-sm ms-3">Kaldır</button>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <strong className="fs-5">{(item.price * item.quantity).toFixed(2)} TL</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Sipariş Özeti</h5>
                <hr/>
                <p className="d-flex justify-content-between">
                  <strong>Toplam Tutar:</strong>
                  <strong>{totalPrice.toFixed(2)} TL</strong>
                </p>
                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleCompletePurchase}
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Onaylanıyor...' : 'Alışverişi Tamamla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}