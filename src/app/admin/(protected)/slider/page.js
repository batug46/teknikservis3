'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Image, Link2, Hash, X, Save } from 'lucide-react';

export default function AdminSliderPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideData, setSlideData] = useState({ title: '', imageUrl: '', order: 0, linkUrl: '' });
  const [feedback, setFeedback] = useState({ show: false, type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ show: true, type, message });
    setTimeout(() => setFeedback({ show: false, type: '', message: '' }), 4000);
  };

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/slider');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      } else {
        showFeedback('error', 'Slider verileri yüklenemedi');
      }
    } catch (error) {
      console.error("Slider verileri çekilemedi:", error);
      showFeedback('error', 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openModalForCreate = () => {
    console.log('Opening modal for create slide');
    setEditingSlide(null);
    setSlideData({ title: '', imageUrl: '', order: 0, linkUrl: '' });
    setShowModal(true);
  };

  const openModalForEdit = (slide) => {
    console.log('Opening modal for edit slide:', slide.id);
    setEditingSlide(slide);
    setSlideData({ 
      title: slide.title, 
      imageUrl: slide.imageUrl, 
      order: slide.order, 
      linkUrl: slide.linkUrl || '' 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu slide\'ı silmek istediğinizden emin misiniz?')) {
      try {
        const res = await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showFeedback('success', 'Slide başarıyla silindi');
      fetchSlides();
        } else {
          showFeedback('error', 'Slide silinemedi');
        }
      } catch (error) {
        console.error('Delete error:', error);
        showFeedback('error', 'Bir hata oluştu');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // linkUrl'yi temizle
      const cleanSlideData = {
        ...slideData,
        linkUrl: slideData.linkUrl.trim()
      };
      
    const url = editingSlide 
      ? `/api/admin/slider/${editingSlide.id}` 
      : '/api/admin/slider';
    const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanSlideData),
    });

      if (response.ok) {
    setShowModal(false);
        showFeedback('success', editingSlide ? 'Slide güncellendi' : 'Yeni slide eklendi');
    fetchSlides();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        showFeedback('error', errorData.error || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showFeedback('error', 'Bağlantı hatası');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Slider verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback.show && (
        <div className={`p-4 rounded-lg border-l-4 ${
          feedback.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Slider Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Ana sayfa slider'ını yönetin</p>
        </div>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors duration-200 font-medium gap-2 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Yeni Slide Ekle
        </button>
      </div>

      {/* Slides Grid */}
      {slides.length === 0 ? (
        <div className="text-center py-12">
          <Image size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz slide yok</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">İlk slide'ınızı ekleyerek başlayın</p>
          <button
            onClick={openModalForCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 font-medium gap-2"
          >
            <Plus size={20} />
            Slide Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map(slide => (
            <div key={slide.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Slide Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hw7Zyc2VsIHnDvGtsZW5lbWVkaS4uLjwvdGV4dD4KPC9zdmc+';
                  }}
                />
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200">
                  #{slide.order}
                </div>
              </div>

              {/* Slide Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{slide.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Hash size={16} className="mr-2" />
                    Sıra: {slide.order}
                  </div>
                  
                  {slide.linkUrl && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Link2 size={16} className="mr-2" />
                      <span className="truncate">{slide.linkUrl}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModalForEdit(slide)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg 
                             transition-colors duration-200 font-medium flex items-center justify-center gap-2
                             border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <Edit size={16} />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg 
                             transition-colors duration-200 font-medium flex items-center justify-center gap-2
                             border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600"
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingSlide ? 'Slide Düzenle' : 'Yeni Slide Ekle'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                disabled={submitting}
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
                </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto scroll-smooth overscroll-contain" 
                 style={{ 
                   scrollBehavior: 'smooth',
                   WebkitOverflowScrolling: 'touch'
                 }}>
              <form id="slide-form" onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Başlık *</label>
                <input
                  type="text"
                  value={slideData.title}
                  onChange={e => setSlideData({...slideData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Slide başlığını girin"
                  required
                />
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Görsel URL *</label>
                <input
                  type="url"
                  value={slideData.imageUrl}
                  onChange={e => setSlideData({...slideData, imageUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {slideData.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={slideData.imageUrl} 
                      alt="Önizleme" 
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Link URL (İsteğe Bağlı)</label>
                <input
                  type="text"
                  value={slideData.linkUrl}
                  onChange={e => setSlideData({...slideData, linkUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="/products, /book-appointment vb."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Slide'a tıklandığında gidilecek sayfa</p>
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Sıra *</label>
                <input
                  type="number"
                  value={slideData.order}
                  onChange={e => setSlideData({...slideData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Küçük sayılar önce gösterilir</p>
                </div>

                </form>
            </div>

            {/* Modal Footer - Always Visible */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                           transition-colors duration-200 font-medium"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                form="slide-form"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors duration-200 font-medium flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingSlide ? 'Güncelle' : 'Ekle'}
                    </>
                  )}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
} 