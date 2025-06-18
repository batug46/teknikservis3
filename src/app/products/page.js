'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Ürünler yüklenemedi.');
        const data = await res.json();
        setAllProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Randevu Al fonksiyonu
  const handleBookAppointment = (serviceName) => {
    router.push(`/book-appointment?service=${encodeURIComponent(serviceName)}`);
  };

  // Sepete Ekle fonksiyonu
  const handleAddToCart = (productToAdd) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productToAdd.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...productToAdd, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setAddedToCart(productToAdd.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const serviceProducts = allProducts.filter(p => p.category === 'servis');
  const physicalProducts = allProducts.filter(p => p.category === 'urun');

  if (loading) return <div className="container my-5 text-center">Yükleniyor...</div>;

  return (
    <div className="container my-5">
      {/* HİZMETLER BÖLÜMÜ */}
      <div className="mb-5">
        <h2>Tamir, Değişim, Kurulum</h2>
        <div className="row g-4 mt-2">
          {serviceProducts.map((product) => (
            <div key={product.id} className="col-md-4">
              <div className="card h-100">
                <img 
                  src={product.imageUrl || `https://placehold.co/600x400.png?text=Gorsel+Yok`} 
                  className="card-img-top" alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text fs-5 fw-bold text-primary mt-auto pt-2">
                    {product.price.toFixed(2)} TL
                  </p>
                  <button
                    onClick={() => handleBookAppointment(product.name)}
                    className="btn btn-primary w-100 mt-2"
                  >
                    Randevu Al
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-5" />

      {/* SATILABİLİR ÜRÜNLER BÖLÜMÜ (SEPETE EKLE BUTONU GERİ GETİRİLDİ) */}
      <div>
        <h2>Ürünler</h2>
        <div className="row g-4 mt-2">
          {physicalProducts.map((product) => (
            <div key={product.id} className="col-md-4">
              <div className="card h-100 d-flex flex-column">
                <Link href={`/products/${product.id}`} className="text-decoration-none text-dark d-block">
                  <img 
                    src={product.imageUrl || `https://placehold.co/600x400.png?text=Gorsel+Yok`}
                    className="card-img-top" alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text fs-5 fw-bold text-primary">
                      {product.price.toFixed(2)} TL
                    </p>
                  </div>
                </Link>
                <div className="card-footer bg-white border-0 pb-3 mt-auto">
                    <button
                        onClick={() => handleAddToCart(product)}
                        className={`btn w-100 ${addedToCart === product.id ? 'btn-success' : 'btn-primary'}`}
                        disabled={addedToCart === product.id || product.stock === 0}
                    >
                        {product.stock === 0 ? 'Tükendi' : (addedToCart === product.id ? 'Sepete Eklendi!' : 'Sepete Ekle')}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 