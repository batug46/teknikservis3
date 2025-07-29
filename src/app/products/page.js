'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Calendar, 
  Package, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(null);
  const router = useRouter();

  // Filtreleme ve arama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'urun', 'hizmet'
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'instock', 'outstock'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price', 'stock'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products', {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          // Sadece aktif ürünleri göster
          const activeProducts = data.filter(product => product.isActive !== false);
          setAllProducts(activeProducts);
        } else {
          console.error('Ürünler yüklenemedi:', response.status);
        }
      } catch (error) {
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtreleme ve sıralama işlemi
  useEffect(() => {
    let filtered = [...allProducts];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Kategori filtresi
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Stok filtresi
    if (stockFilter === 'instock') {
      filtered = filtered.filter(product => product.stock > 0);
    } else if (stockFilter === 'outstock') {
      filtered = filtered.filter(product => product.stock <= 0);
    }

    // Fiyat filtresi
    if (minPrice) {
      filtered = filtered.filter(product => parseFloat(product.price) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(product => parseFloat(product.price) <= parseFloat(maxPrice));
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, categoryFilter, stockFilter, minPrice, maxPrice, sortBy, sortOrder]);

  // Güvenli fiyat formatı fonksiyonu
  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

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

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Aktif filtre sayısı
  const activeFiltersCount = [
    searchTerm,
    categoryFilter !== 'all',
    stockFilter !== 'all',
    minPrice,
    maxPrice,
    sortBy !== 'name' || sortOrder !== 'asc'
  ].filter(Boolean).length;

  const physicalProducts = filteredProducts.filter(p => p.category === 'urun');
  const serviceProducts = filteredProducts.filter(p => p.category === 'hizmet');

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Ürünler yükleniyor...</span>
    </div>
  );

  // Filtre Sidebar Komponenti
  const FilterSidebar = ({ className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md border border-gray-100 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center">
          <Sliders className="w-4 h-4 mr-2" />
          Filtreler
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Temizle
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Kategori Filtresi */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Kategori</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="all">Tümü</option>
            <option value="urun">Ürünler</option>
            <option value="hizmet">Hizmetler</option>
          </select>
        </div>

        {/* Stok Filtresi */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Stok Durumu</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="all">Tümü</option>
            <option value="instock">Stokta Var</option>
            <option value="outstock">Stokta Yok</option>
          </select>
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Fiyat Aralığı (₺)</label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min fiyat"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Max fiyat"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Sıralama */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Sıralama</label>
          <div className="space-y-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="name">İsme Göre</option>
              <option value="price">Fiyata Göre</option>
              <option value="stock">Stok Durumuna Göre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full flex items-center justify-center gap-2 px-2.5 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc className="w-3 h-3" />
                  Artan
                </>
              ) : (
                <>
                  <SortDesc className="w-3 h-3" />
                  Azalan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header - Küçültülmüş */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Ürünler & Hizmetler</h1>
        <p className="text-sm text-gray-600">Aradığınız ürünü kolayca bulun</p>
      </div>

      {/* Arama Kutusu ve Mobil Filtre Toggle - Daha kompakt */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Arama Kutusu - Küçültülmüş */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Ürün adı veya açıklama ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>

          {/* Mobil Filtre Toggle ve Sonuç Sayısı */}
          <div className="flex items-center justify-between lg:justify-end gap-3">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {filteredProducts.length} ürün bulundu
            </span>
            
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              Filtreler
              {activeFiltersCount > 0 && (
                <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              {showMobileFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobil Filtreler */}
        {showMobileFilters && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-100">
            <FilterSidebar />
          </div>
        )}
      </div>

      {/* Ana İçerik */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol Sidebar - Küçültülmüş genişlik */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar className="sticky top-6" />
        </div>

        {/* Sağ İçerik - Ürünler */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aradığınız kriterlere uygun ürün bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">Lütfen filtrelerinizi değiştirip tekrar deneyin.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Ürünler Bölümü */}
              {physicalProducts.length > 0 && (
                <div>
                  <div className="flex items-center mb-5">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      Ürünlerimiz ({physicalProducts.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {physicalProducts.map(product => (
                      <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {product.imageUrl && (
                          <Link href={`/products/${product.id}`} className="block cursor-pointer">
                            <div className="aspect-w-16 aspect-h-9">
                              <img 
                                src={product.imageUrl} 
                                className="w-full h-48 object-cover" 
                                alt={product.name}
                              />
                            </div>
                          </Link>
                        )}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)} ₺</span>
                              <div className="flex items-center mt-1">
                                {product.category === 'hizmet' ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">Müsait</span>
                                  </>
                                ) : product.stock > 0 ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-600">Stokta: {product.stock}</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                    <span className="text-sm text-red-600">Stokta Yok</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Butonlar */}
                          <div className="space-y-3">
                            {/* Ürünü İncele Butonu */}
                            <Link
                              href={`/products/${product.id}`}
                              className="w-full px-4 py-3 bg-black/60 text-white rounded-lg font-semibold 
                                       hover:bg-black/80 transition-colors duration-300 
                                       flex items-center justify-center gap-2"
                            >
                              <Eye size={20} />
                              Ürünü İncele
                            </Link>
                            
                            {/* Sepete Ekle Butonu */}
                            <button
                              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ease-out flex items-center justify-center ${
                                product.stock <= 0 
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : addedToCart === product.id
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                            >
                              {product.stock <= 0 ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Stokta Yok
                                </>
                              ) : addedToCart === product.id ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Sepete Eklendi
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Sepete Ekle
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Servisler/Randevu Bölümü */}
              {serviceProducts.length > 0 && (
                <div>
                  <div className="flex items-center mb-5">
                    <Wrench className="w-5 h-5 mr-2 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">
                      Teknik Servis Hizmetlerimiz ({serviceProducts.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {serviceProducts.map(service => (
                      <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        {service.imageUrl && (
                          <div className="aspect-w-16 aspect-h-9 cursor-pointer" onClick={() => handleBookAppointment(service.name)}>
                            <img 
                              src={service.imageUrl} 
                              className="w-full h-48 object-cover" 
                              alt={service.name}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                          
                          <div className="mb-4">
                            <span className="text-sm text-gray-500">Başlangıç Fiyatı:</span>
                            <div className="text-2xl font-bold text-green-600">{formatPrice(service.price)} ₺</div>
                          </div>
                          
                          <button
                            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 ease-out flex items-center justify-center"
                            onClick={() => handleBookAppointment(service.name)}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Randevu Al
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 