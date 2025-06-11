'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Ürün verisinin tipini tanımlayalım
interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
}

// Sepet verisinin tipini tanımlayalım
interface CartItem extends Product {
  quantity: number;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Bu API rotasını bir sonraki adımda oluşturacağız.
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error('Ürün bulunamadı.');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Mevcut sepeti localStorage'dan al
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Ürün sepette zaten var mı diye kontrol et
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      // Varsa, miktarını artır
      existingItem.quantity += 1;
    } else {
      // Yoksa, yeni ürün olarak ekle
      cart.push({ ...product, quantity: 1 });
    }

    // Güncellenmiş sepeti localStorage'a kaydet
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Kullanıcıyı sepet sayfasına yönlendir
    router.push('/cart');
  };

  if (loading) return <div className="text-center my-5">Yükleniyor...</div>;
  if (error) return <div className="text-center my-5 text-danger">Hata: {error}</div>;
  if (!product) return <div className="text-center my-5">Ürün bulunamadı.</div>;

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={product.imageUrl || 'https://placehold.co/600x400/EEE/31343C?text=Görsel+Yok'} 
            alt={product.name} 
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="lead text-muted">{product.description}</p>
          <h3 className="my-3 text-primary">{product.price.toFixed(2)} TL</h3>
          <p>Stok Durumu: {product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}</p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <i className="bi bi-cart-plus me-2"></i>
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
