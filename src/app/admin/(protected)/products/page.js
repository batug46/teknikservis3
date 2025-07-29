'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Edit3, Trash2, Eye, X, Save, Image as ImageIcon, ShoppingCart, Calendar, CheckCircle, XCircle, Search, SortAsc, SortDesc, Filter } from 'lucide-react';

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productData, setProductData] = useState({ name: '', description: '', price: 0, imageUrl: '', category: 'hizmet', stock: 0 });
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, inStock, outOfStock, lowStock
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtreleme ve sıralama işlemi
  useEffect(() => {
    let filtered = [...allProducts];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Kategori filtresi
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Stok filtresi
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        const stock = product.stock || 0;
        
        // Hizmetler için özel durum - her zaman müsait kabul et
        if (product.category === 'hizmet') {
          switch (stockFilter) {
            case 'inStock':
            case 'available':
              return true; // Hizmetler her zaman müsait
            case 'outOfStock':
            case 'unavailable':
              return false; // Hizmetler asla tükenmez
            case 'lowStock':
              return false; // Hizmetler için az stok kavramı yok
            default:
              return true;
          }
        }
        
        // Ürünler için normal stok kontrolü
        switch (stockFilter) {
          case 'inStock':
            return stock > 5;
          case 'lowStock':
            return stock > 0 && stock <= 5;
          case 'outOfStock':
            return stock === 0;
          default:
            return true;
        }
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '', 'tr');
          break;
        case 'price':
          comparison = parseFloat(a.price || 0) - parseFloat(b.price || 0);
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '', 'tr');
          break;
        case 'date':
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, categoryFilter, stockFilter, sortBy, sortOrder]);

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 4000);
  };

  // Güvenli fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      } else {
        showFeedback('error', 'Ürünler yüklenemedi');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showFeedback('error', 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openModalForCreate = () => {
    setEditingProduct(null);
    setProductData({ name: '', description: '', price: 0, imageUrl: '', category: 'hizmet', stock: 0 });
    setShowModal(true);
  };

  const openModalForEdit = (product) => {
    setEditingProduct(product);
    setProductData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      imageUrl: product.imageUrl || '',
      category: product.category || 'hizmet',
      stock: product.stock || 0
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setProductData({ name: '', description: '', price: 0, imageUrl: '', category: 'hizmet', stock: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productData.name || !productData.description) {
      showFeedback('error', 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        showFeedback('success', editingProduct ? 'Ürün güncellendi' : 'Ürün eklendi');
        fetchProducts();
        closeModal();
      } else {
        const error = await res.json();
        showFeedback('error', error.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showFeedback('error', 'Bağlantı hatası');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAllProducts(prev => prev.filter(product => product.id !== productId));
        showFeedback('success', 'Ürün başarıyla silindi!');
      } else {
        showFeedback('error', 'Ürün silinirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      showFeedback('error', 'Ürün silinirken bir hata oluştu.');
    }
  };

  const toggleActive = async (productId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });

      if (response.ok) {
        // Ürün listesini güncelle
        setAllProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, isActive: !currentStatus }
              : product
          )
        );
        showFeedback('success', `Ürün ${!currentStatus ? 'etkinleştirildi' : 'devre dışı bırakıldı'}!`);
      } else {
        showFeedback('error', 'Ürün durumu güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Ürün durumu güncellenirken hata:', error);
      showFeedback('error', 'Ürün durumu güncellenirken bir hata oluştu.');
    }
  };

  const getStockBadge = (stock, category) => {
    // Hizmetler için stok bilgisi yerine "Müsait" göster
    if (category === 'hizmet') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Müsait
        </span>
      );
    }

    // Ürünler için normal stok bilgisi
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Tükendi
        </span>
      );
    } else if (stock <= 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Eye className="w-3 h-3 mr-1" />
          Az Stok ({stock})
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Stokta ({stock})
        </span>
      );
    }
  };

  const getCategoryBadge = (category) => {
    const isPhysical = category === 'urun';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPhysical 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      }`}>
        {isPhysical ? (
          <>
            <Package className="w-3 h-3 mr-1" />
            Ürün
          </>
        ) : (
          <>
            <ShoppingCart className="w-3 h-3 mr-1" />
            Hizmet
          </>
        )}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Ürünler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {feedback.show && (
        <div className={`rounded-md p-4 ${
          feedback.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
            : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {feedback.type === 'error' ? (
                <XCircle className="h-5 w-5" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-900 flex items-center">
          <Package className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
          Ürün Yönetimi
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} / {allProducts.length} ürün
          </div>
          <button
            onClick={openModalForCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </button>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Arama */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Ürün adı, açıklama veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>

          {/* Kategori Filtresi */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="urun">Ürün</option>
              <option value="hizmet">Hizmet</option>
            </select>
          </div>

          {/* Stok Filtresi */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">Tüm Stok Durumları</option>
              <option value="inStock">Stokta / Müsait</option>
              <option value="lowStock">Az Stok</option>
              <option value="outOfStock">Tükendi</option>
            </select>
          </div>

          {/* Sıralama ve Temizle */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="name">İsme Göre</option>
              <option value="price">Fiyata Göre</option>
              <option value="stock">Stok'a Göre</option>
              <option value="category">Kategoriye Göre</option>
              <option value="date">Tarihe Göre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Temizle Butonu ve Sonuç Sayısı */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredProducts.length} ürün bulundu
          </div>
          {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Ürünler Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fiyat</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    !product.isActive ? 'opacity-50 bg-gray-100 dark:bg-gray-700/50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.imageUrl ? (
                          <img className="h-10 w-10 rounded-lg object-cover" src={product.imageUrl} alt={product.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {product.name}
                          {!product.isActive && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                              Devre Dışı
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatPrice(product.price)} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStockBadge(product.stock || 0, product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleActive(product.id, product.isActive)}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md transition-colors duration-200 ${
                          product.isActive
                            ? 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                        title={product.isActive ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                      >
                        {product.isActive ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Devre Dışı
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Etkinleştir
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openModalForEdit(product)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş Durum */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' 
                ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
                : 'Henüz ürün bulunmuyor.'}
            </h3>
            {(searchTerm || categoryFilter !== 'all' || stockFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ürün Ekleme/Düzenleme Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Ürün adını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açıklama *
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productData.stock}
                      onChange={(e) => setProductData({ ...productData, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={productData.category}
                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="hizmet">Hizmet</option>
                    <option value="urun">Ürün</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resim URL'si
                  </label>
                  <input
                    type="url"
                    value={productData.imageUrl}
                    onChange={(e) => setProductData({ ...productData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingProduct ? 'Güncelle' : 'Ekle'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
      