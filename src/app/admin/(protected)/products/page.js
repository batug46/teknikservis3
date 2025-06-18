'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({ name: '', description: '', price: 0, imageUrl: '', category: 'servis', stock: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openModalForCreate = () => {
    setEditingProduct(null);
    setProductData({ name: '', description: '', price: 0, imageUrl: '', category: 'servis', stock: 0 });
    setShowModal(true);
  };

  const openModalForEdit = (product) => {
    setEditingProduct(product);
    setProductData(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    setShowModal(false);
    fetchProducts();
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Ürün Yönetimi</h1>
        <button className="btn btn-primary" onClick={openModalForCreate}>Yeni Ürün/Hizmet Ekle</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Görsel</th>
              <th>İsim</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Stok</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td><img src={product.imageUrl || ''} alt={product.name} width="50" /></td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price} TL</td>
                <td>{product.stock}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModalForEdit(product)}>Düzenle</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(product.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form onSubmit={handleFormSubmit}>
              <div className="modal-content">
                 <div className="modal-header">
                  <h5 className="modal-title">{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                 <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label">Kategori</label>
                        <select className="form-select" value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})}>
                            <option value="servis">Hizmet (Randevu Al)</option>
                            <option value="urun">Ürün (Sepete Ekle)</option>
                        </select>
                    </div>
                    <div className="mb-3">
                      <label>İsim</label>
                      <input type="text" className="form-control" value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} required/>
                    </div>
                     <div className="mb-3">
                      <label>Açıklama</label>
                      <textarea className="form-control" value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})}></textarea>
                    </div>
                    <div className="mb-3">
                      <label>Fiyat</label>
                      <input type="number" step="0.01" className="form-control" value={productData.price} onChange={e => setProductData({...productData, price: parseFloat(e.target.value) || 0})} required/>
                    </div>
                     <div className="mb-3">
                      <label>Görsel URL</label>
                      <input type="text" className="form-control" value={productData.imageUrl} onChange={e => setProductData({...productData, imageUrl: e.target.value})} />
                    </div>
                     <div className="mb-3">
                      <label>Stok</label>
                      <input type="number" className="form-control" value={productData.stock} onChange={e => setProductData({...productData, stock: parseInt(e.target.value) || 0})} required/>
                    </div>
                 </div>
                 <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Kapat</button>
                  <button type="submit" className="btn btn-primary">Kaydet</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 