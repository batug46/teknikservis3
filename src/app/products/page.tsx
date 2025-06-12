'use client';

import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Ürünler yüklenemedi.');
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error(err);
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
    window.dispatchEvent(new Event('storage'));
    setAddedToCart(productToAdd.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  if (loading) return <div className="container my-5 text-center">Yükleniyor...</div>;

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-12">
          <h2>Tüm Ürünler</h2>
          <div className="row g-4 mt-2">
            {products.map((product) => (
              <div key={product.id} className="col-md-4">
                <div className="card h-100">
                  <img 
                    src={product.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(product.name)}`} 
                    className="card-img-top" 
                    alt={product.name}
                    style={{ height: '200px', objectFit: 'cover' }}
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
    </div>
  );
}