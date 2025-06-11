'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Ürün ve Sepet tiplerini tanımlıyoruz
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState<number | null>(null); // Hangi ürünün sepete eklendiğini tutar

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) {
          throw new Error('Ürünler yüklenemedi.');
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productToAdd: Product) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productToAdd.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...productToAdd, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Diğer bileşenlerin (Navbar gibi) sepet değişikliğinden haberdar olmasını sağlar
    window.dispatchEvent(new Event('storage'));

    // Kullanıcıya geri bildirim vermek için butonun durumunu değiştir
    setAddedToCart(productToAdd.id);
    setTimeout(() => {
      setAddedToCart(null);
    }, 2000); // 2 saniye sonra buton eski haline döner
  };

  if (loading) {
    return <div className="container my-5 text-center">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="container my-5 text-center text-danger">Hata: {error}</div>;
  }

  return (
    <div className="container my-5">
      <div className="row mb-4">
        {/* Filtreler Bölümü... */}
        <div className="col-md-3">
            {/* Filtreleme arayüzü burada yer alabilir */}
        </div>

        {/* Ürün Listesi Bölümü */}
        <div className="col-md-9">
          <h2>Tüm Ürünler</h2>
          <div className="row g-4 mt-2">
            {products.map((product) => (
              <div key={product.id} className="col-md-4">
                <div className="card h-100 shadow-sm">
                   <img 
                    src={product.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=Görsel+Yok'} 
                    className="card-img-top" 
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted flex-grow-1">
                      {product.description?.substring(0, 60) || 'Açıklama mevcut değil.'}...
                    </p>
                    <p className="card-text fs-5 fw-bold text-primary">
                      {product.price.toFixed(2)} TL
                    </p>
                    {/* Buton "İncele" yerine "Sepete Ekle" olarak değiştirildi */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`btn w-100 mt-auto ${addedToCart === product.id ? 'btn-success' : 'btn-primary'}`}
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
    </div>
  );
}
