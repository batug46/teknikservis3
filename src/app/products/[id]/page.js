'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  ShoppingCart, Star, ArrowLeft, Package, CheckCircle, XCircle, 
  Heart, Share2, Truck, Shield, RotateCcw, MessageCircle,
  ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, Calendar,
  User, Verified, Filter, SortAsc, SortDesc, Edit3, Trash2, X,
  Camera, X as XIcon
} from 'lucide-react';

export default function ProductDetailPage({ params }) {
  const { data: session } = useSession();
  const [product, setProduct] = useState(null);
  const [ratingInfo, setRatingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  // Yorum sistemi state'leri
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Yorum düzenleme state'leri
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ rating: 5, title: '', comment: '', images: [] });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  
  // Benzer ürünler
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  
  // Galeri
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      try {
        const [productRes, ratingRes, likeRes, reviewsRes, similarRes] = await Promise.all([
          fetch(`/api/products/${params.id}`),
          fetch(`/api/products/${params.id}/rating`),
          fetch(`/api/products/${params.id}/like`),
          fetch(`/api/products/${params.id}/reviews`),
          fetch(`/api/products/${params.id}/similar`)
        ]);
        
        if (!productRes.ok) throw new Error('Ürün bulunamadı.');
        
        const productData = await productRes.json();
        setProduct(productData);
        
        if(ratingRes.ok) setRatingInfo(await ratingRes.json());
        if(likeRes.ok) {
          const likeData = await likeRes.json();
          setIsLiked(likeData.liked);
        }
        
        if(reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews);
          setReviewSummary(reviewsData.summary);
        }
        
        if(similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarProducts(similarData.similarProducts);
        }

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
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleLike = async () => {
    if (!product) return;
    setLikeLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error('Beğenme hatası:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: product.description || `${product.name} - ${formatPrice(product.price)} ₺`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: URL'yi panoya kopyala
        await navigator.clipboard.writeText(window.location.href);
        alert('Link panoya kopyalandı!');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      // Fallback: URL'yi panoya kopyala
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link panoya kopyalandı!');
      } catch (clipboardError) {
        console.error('Pano kopyalama hatası:', clipboardError);
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // İndirim hesaplama
  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice) return 0;
    const original = parseFloat(originalPrice);
    const current = parseFloat(currentPrice);
    return Math.round(((original - current) / original) * 100);
  };

  // Stok uyarısı
  const getStockWarning = (stock) => {
    if (stock <= 0) return null;
    if (stock <= 5) return `Sadece ${stock} adet kaldı!`;
    if (stock <= 10) return `Son ${stock} adet!`;
    return null;
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Yorum sistemi fonksiyonları
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;
    
    setSubmittingReview(true);
    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews([data.review, ...reviews]);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '', images: [] });
        
        // Yorum özetini güncelle
        if (reviewSummary) {
          setReviewSummary({
            ...reviewSummary,
            totalReviews: reviewSummary.totalReviews + 1,
            averageRating: ((reviewSummary.averageRating * reviewSummary.totalReviews + reviewForm.rating) / (reviewSummary.totalReviews + 1))
          });
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Yorum eklenemedi');
      }
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      alert('Yorum eklenirken bir hata oluştu');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Çok Kötü',
      2: 'Kötü',
      3: 'Orta',
      4: 'İyi',
      5: 'Mükemmel'
    };
    return texts[rating] || 'Değerlendirme';
  };

  // Yorum düzenleme fonksiyonları
  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
      images: review.images || []
    });
    setShowEditModal(true);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!product || !editingReview) return;
    
    setSubmittingEdit(true);
    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: editingReview.id,
          ...editForm
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(reviews.map(review => 
          review.id === editingReview.id ? data.review : review
        ));
        setShowEditModal(false);
        setEditingReview(null);
        setEditForm({ rating: 5, title: '', comment: '', images: [] });
        alert('Yorum başarıyla güncellendi!');
      } else {
        const error = await response.json();
        alert(error.error || 'Yorum güncellenemedi');
      }
    } catch (error) {
      console.error('Yorum güncelleme hatası:', error);
      alert('Yorum güncellenirken bir hata oluştu');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!product || !confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/products/${product.id}/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setReviews(reviews.filter(review => review.id !== reviewId));
        
        // Yorum özetini güncelle
        if (reviewSummary) {
          const deletedReview = reviews.find(r => r.id === reviewId);
          if (deletedReview) {
            const newTotal = reviewSummary.totalReviews - 1;
            const newAverage = newTotal > 0 
              ? ((reviewSummary.averageRating * reviewSummary.totalReviews - deletedReview.rating) / newTotal)
              : 0;
            setReviewSummary({
              ...reviewSummary,
              totalReviews: newTotal,
              averageRating: newAverage
            });
          }
        }
        alert('Yorum başarıyla silindi!');
      } else {
        const error = await response.json();
        alert(error.error || 'Yorum silinemedi');
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      alert('Yorum silinirken bir hata oluştu');
    }
  };

  // Kullanıcının kendi yorumu mu kontrol et
  const isOwnReview = (review) => {
    if (!session?.user?.id) return false;
    return review.user.id === session.user.id;
  };

  // Fotoğraf yükleme fonksiyonları
  const handleImageUpload = (e, formType = 'review') => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (files.length > maxFiles) {
      alert(`En fazla ${maxFiles} fotoğraf yükleyebilirsiniz`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`${file.name} dosyası çok büyük (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} geçerli bir resim dosyası değil`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Dosyaları base64'e çevir
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        if (formType === 'review') {
          setReviewForm(prev => ({
            ...prev,
            images: [...prev.images, base64]
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            images: [...prev.images, base64]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index, formType = 'review') => {
    if (formType === 'review') {
      setReviewForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Ürün yükleniyor...</span>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-20">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün bulunamadı</h2>
        <p className="text-gray-600 mb-8">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link 
          href="/products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ürünlere Geri Dön
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors">Ürünler</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Ürün Görselleri */}
        <div className="space-y-4">
          {/* Ana Görsel */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
            <img 
              src={product.images && product.images.length > 0 
                ? product.images[currentImageIndex] 
                : product.imageUrl || 'https://placehold.co/600x600.png?text=Görsel+Yok'
              } 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Galeri Navigasyon */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(product.images.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === product.images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Küçük Görseller */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index 
                      ? 'border-blue-500' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
            
            {/* Değerlendirmeler */}
            {ratingInfo && ratingInfo.count > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.round(ratingInfo.average) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {ratingInfo.average.toFixed(1)} ({ratingInfo.count} değerlendirme)
                </span>
              </div>
            )}
          </div>

          {/* Fiyat */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-baseline space-x-2">
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)} ₺</span>
                  <span className="text-2xl text-gray-500 line-through">{formatPrice(product.originalPrice)} ₺</span>
                  <span className="text-lg font-semibold text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                    %{calculateDiscount(product.originalPrice, product.price)} İndirim
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)} ₺</span>
              )}
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ürün Açıklaması</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || 'Bu ürün için açıklama mevcut değil.'}
            </p>
          </div>

          {/* Sosyal Kanıt ve Stok Durumu */}
          <div className="space-y-3">
            {/* Stok Durumu */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Stokta ({product.stock} adet)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Stokta Yok</span>
                </>
              )}
            </div>

            {/* Stok Uyarısı */}
            {getStockWarning(product.stock) && (
              <div className="flex items-center space-x-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <span className="text-orange-600 font-medium">{getStockWarning(product.stock)}</span>
              </div>
            )}

            {/* Sosyal Kanıt */}
            <div className="space-y-2">
              {product.soldCount > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>🔥 {product.soldCount} kişi bu ürünü satın aldı</span>
                </div>
              )}
              {product.viewCount > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>👁️ {product.viewCount} kez görüntülendi</span>
                </div>
              )}
            </div>
          </div>

          {/* Miktar Seçici */}
          {product.stock > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miktar</label>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  -
                </button>
                <span className="w-16 h-10 border border-gray-300 rounded-lg flex items-center justify-center font-medium text-gray-700 dark:text-gray-300">
                  {quantity}
                </span>
                <button 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={quantity === 0}
                className="flex-1 bg-black/60 text-white py-4 px-6 rounded-xl font-semibold text-lg 
                             hover:bg-black/80 transition-colors duration-300 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-3"
              >
                {product.stock <= 0 ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Stokta Yok
                  </>
                ) : addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Sepete Eklendi!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Sepete Ekle
                  </>
                )}
              </button>
              
              <button 
                onClick={handleLike}
                disabled={likeLoading}
                className={`p-4 border rounded-lg transition-colors ${
                  isLiked 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                    : 'border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-6 h-6 ${
                  isLiked 
                    ? 'text-red-600 dark:text-red-400 fill-current' 
                    : 'text-gray-600 dark:text-gray-300'
                }`} />
              </button>
              
              <button 
                onClick={handleShare}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Ürün Özellikleri */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ürün Özellikleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hizmet Özellikleri */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Ücretsiz Kargo (250₺ ve üzeri)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-300">2 Yıl Garanti</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span className="text-gray-700 dark:text-gray-300">14 Gün İade Garantisi</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700 dark:text-gray-300">7/24 Teknik Destek</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteri Yorumları</h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yorum Yap
          </button>
        </div>

        {/* Yorum Özeti */}
        {reviewSummary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reviewSummary.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.round(reviewSummary.averageRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {reviewSummary.totalReviews} yorum
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviewSummary.ratingDistribution[rating] || 0;
                    const percentage = reviewSummary.totalReviews > 0 
                      ? (count / reviewSummary.totalReviews) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yorum Formu */}
        {showReviewForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yorum Yap</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Puanınız
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating })}
                      className={`p-2 rounded-lg transition-colors ${
                        reviewForm.rating >= rating
                          ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${reviewForm.rating >= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {getRatingText(reviewForm.rating)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Başlık (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Yorum başlığı..."
                  maxLength={100}
                />
              </div>
              
                             <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Yorumunuz *
                 </label>
                 <textarea
                   value={reviewForm.comment}
                   onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                   rows={4}
                   placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
                   required
                   minLength={10}
                 />
                 <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                   En az 10 karakter yazmalısınız
                 </div>
               </div>

               {/* Fotoğraf Yükleme */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Fotoğraflar (İsteğe Bağlı)
                 </label>
                 <div className="space-y-3">
                   {/* Fotoğraf Yükleme Butonu */}
                   <div className="flex items-center space-x-2">
                     <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                       <Camera className="w-4 h-4 mr-2" />
                       Fotoğraf Ekle
                       <input
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={(e) => handleImageUpload(e, 'review')}
                         className="hidden"
                       />
                     </label>
                     <span className="text-xs text-gray-500 dark:text-gray-400">
                       En fazla 5 fotoğraf, max 5MB
                     </span>
                   </div>

                   {/* Yüklenen Fotoğraflar */}
                   {reviewForm.images.length > 0 && (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                       {reviewForm.images.map((image, index) => (
                         <div key={index} className="relative group">
                           <img
                             src={image}
                             alt={`Yorum fotoğrafı ${index + 1}`}
                             className="w-full h-24 object-cover rounded-lg"
                           />
                           <button
                             type="button"
                             onClick={() => removeImage(index, 'review')}
                             className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             <XIcon className="w-3 h-3" />
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submittingReview || reviewForm.comment.length < 10}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingReview ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {review.user.adSoyad?.charAt(0) || review.user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.user.adSoyad || review.user.name || 'Anonim'}
                        </span>
                        {review.isVerified && (
                          <Verified className="w-4 h-4 text-green-500" title="Doğrulanmış Alışveriş" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < review.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {getRatingText(review.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </div>
                    {isOwnReview(review) && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Yorumu Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Yorumu Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                )}
                
                                 <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                   {review.comment}
                 </p>

                 {/* Yorum Fotoğrafları */}
                 {review.images && review.images.length > 0 && (
                   <div className="mt-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                       {review.images.map((image, index) => (
                         <div key={index} className="relative">
                           <img
                             src={image}
                             alt={`Yorum fotoğrafı ${index + 1}`}
                             className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                             onClick={() => {
                               // Büyük görüntüleme için modal açılabilir
                               window.open(image, '_blank');
                             }}
                           />
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Henüz yorum yapılmamış
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Bu ürün için ilk yorumu siz yapın!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                İlk Yorumu Yap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Benzer Ürünler */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Benzer Ürünler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {similarProducts.map((similarProduct) => (
              <Link 
                key={similarProduct.id} 
                href={`/products/${similarProduct.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  <img 
                    src={similarProduct.imageUrl || 'https://placehold.co/400x400.png?text=Görsel+Yok'} 
                    alt={similarProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {similarProduct.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {similarProduct.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(similarProduct.price)} ₺
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {similarProduct.category === 'hizmet' ? 'Hizmet' : 'Ürün'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Geri Dön Butonu */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/products"
          className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ürünlere Geri Dön
        </Link>
      </div>

      {/* Yorum Düzenleme Modal */}
      {showEditModal && editingReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Yorumu Düzenle
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReview(null);
                    setEditForm({ rating: 5, title: '', comment: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Puanınız
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, rating })}
                        className={`p-2 rounded-lg transition-colors ${
                          editForm.rating >= rating
                            ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`w-6 h-6 ${editForm.rating >= rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {getRatingText(editForm.rating)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlık (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Yorum başlığı..."
                    maxLength={100}
                  />
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Yorumunuz *
                   </label>
                   <textarea
                     value={editForm.comment}
                     onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                     rows={4}
                     placeholder="Ürün hakkında düşüncelerinizi paylaşın..."
                     required
                     minLength={10}
                   />
                   <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                     En az 10 karakter yazmalısınız
                   </div>
                 </div>

                 {/* Fotoğraf Yükleme */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Fotoğraflar (İsteğe Bağlı)
                   </label>
                   <div className="space-y-3">
                     {/* Fotoğraf Yükleme Butonu */}
                     <div className="flex items-center space-x-2">
                       <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                         <Camera className="w-4 h-4 mr-2" />
                         Fotoğraf Ekle
                         <input
                           type="file"
                           multiple
                           accept="image/*"
                           onChange={(e) => handleImageUpload(e, 'edit')}
                           className="hidden"
                         />
                       </label>
                       <span className="text-xs text-gray-500 dark:text-gray-400">
                         En fazla 5 fotoğraf, max 5MB
                       </span>
                     </div>

                     {/* Yüklenen Fotoğraflar */}
                     {editForm.images.length > 0 && (
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                         {editForm.images.map((image, index) => (
                           <div key={index} className="relative group">
                             <img
                               src={image}
                               alt={`Yorum fotoğrafı ${index + 1}`}
                               className="w-full h-24 object-cover rounded-lg"
                             />
                             <button
                               type="button"
                               onClick={() => removeImage(index, 'edit')}
                               className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <XIcon className="w-3 h-3" />
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submittingEdit || editForm.comment.length < 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingEdit ? 'Güncelleniyor...' : 'Yorumu Güncelle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingReview(null);
                      setEditForm({ rating: 5, title: '', comment: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    İptal
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