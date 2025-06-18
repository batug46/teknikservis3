'use client';

import React, { useState, useEffect } from 'react';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      try {
        const [productRes, ratingRes] = await Promise.all([
          fetch(`/api/products/${params.id}`),
          fetch(`/api/products/${params.id}/rating`)
        ]);
        
        if (!productRes.ok) throw new Error('Ürün bulunamadı.');
        
        setProduct(await productRes.json());
        if(ratingRes.ok) setRatingInfo(await ratingRes.json());

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) return <div className="text-center my-5">Yükleniyor...</div>;
  if (!product) return <div className="text-center my-5">Ürün bulunamadı.</div>;

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img src={product.imageUrl || 'https://placehold.co/600x400.png?text=Gorsel+Yok'} alt={product.name} className="img-fluid rounded" />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          
          {ratingInfo && ratingInfo.count > 0 && (
            <div className="d-flex align-items-center mb-3">
              <div>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill" style={{color: i < Math.round(ratingInfo.average) ? 'gold' : 'lightgray'}}></i>
                ))}
              </div>
              <span className="ms-2 text-muted">({ratingInfo.count} değerlendirme)</span>
            </div>
          )}

          <p className="lead text-muted">{product.description || 'Bu ürün için açıklama mevcut değil.'}</p>
          <h3 className="my-3 text-primary">{product.price.toFixed(2)} TL</h3>
          <button 
            className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addedToCart}
          >
            <i className="bi bi-cart-plus me-2"></i>
            {addedToCart ? 'Sepete Eklendi!' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
} 