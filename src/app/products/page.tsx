'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  category: string;
}
interface CartItem extends Product {
  quantity: number;
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Ürünler yüklenemedi.');
        const data = await res.json();
        setAllProducts(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleBookAppointment = (serviceName: string) => {
    router.push(`/book-appointment?service=${encodeURIComponent(serviceName)}`);
  };

  const handleAddToCart = (productToAdd: Product) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
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
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400.png?text=Gorsel+Yok')}
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

      {/* SATILABİLİR ÜRÜNLER BÖLÜMÜ */}
      <div>
        <h2>Ürünler</h2>
        <div className="row g-4 mt-2">
          {physicalProducts.map((product) => (
            <div key={product.id} className="col-md-4">
              <div className="card h-100">
                <img 
                  src={product.imageUrl || `https://placehold.co/600x400.png?text=Gorsel+Yok`}
                  className="card-img-top" alt={product.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400.png?text=Gorsel+Yok')}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text fs-5 fw-bold text-primary mt-auto pt-2">
                    {product.price.toFixed(2)} TL
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`btn w-100 mt-2 ${addedToCart === product.id ? 'btn-success' : 'btn-primary'}`}
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