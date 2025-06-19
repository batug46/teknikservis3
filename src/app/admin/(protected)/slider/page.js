'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function AdminSliderPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideData, setSlideData] = useState({ title: '', imageUrl: '', order: 0, linkUrl: '' });

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/slider');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (error) {
      console.error("Slider verileri çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openModalForCreate = () => {
    setEditingSlide(null);
    setSlideData({ title: '', imageUrl: '', order: 0, linkUrl: '' });
    setShowModal(true);
  };

  const openModalForEdit = (slide) => {
    setEditingSlide(slide);
    setSlideData({ title: slide.title, imageUrl: slide.imageUrl, order: slide.order, linkUrl: slide.linkUrl || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu slide\'ı silmek istediğinizden emin misiniz?')) {
      await fetch(`/api/admin/slider/${id}`, { method: 'DELETE' });
      fetchSlides();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = editingSlide 
      ? `/api/admin/slider/${editingSlide.id}` 
      : '/api/admin/slider';
    const method = editingSlide ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slideData),
    });

    setShowModal(false);
    fetchSlides();
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Slider Yönetimi</h1>
        <button className="btn btn-primary" onClick={openModalForCreate}>Yeni Slide Ekle</button>
      </div>

      <div className="row">
        {slides.map(slide => (
          <div key={slide.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={slide.imageUrl} className="card-img-top" alt={slide.title} style={{height: '180px', objectFit: 'cover'}}/>
              <div className="card-body">
                <h5 className="card-title">{slide.title}</h5>
                <p className="card-text">Sıra: {slide.order}</p>
                <p className="card-text text-muted" style={{fontSize: '0.8rem'}}>Link: {slide.linkUrl || 'Yok'}</p>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModalForEdit(slide)}>Düzenle</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(slide.id)}>Sil</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form onSubmit={handleFormSubmit}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingSlide ? 'Slide Düzenle' : 'Yeni Slide Ekle'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Başlık</label>
                    <input type="text" className="form-control" value={slideData.title} onChange={e => setSlideData({...slideData, title: e.target.value})} required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Görsel URL</label>
                    <input type="text" className="form-control" value={slideData.imageUrl} onChange={e => setSlideData({...slideData, imageUrl: e.target.value})} required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Link URL (Tıklanınca Gidilecek Adres)</label>
                    <input type="text" className="form-control" placeholder="/products veya /book-appointment gibi" value={slideData.linkUrl} onChange={e => setSlideData({...slideData, linkUrl: e.target.value})} />
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Sıra</label>
                    <input type="number" className="form-control" value={slideData.order} onChange={e => setSlideData({...slideData, order: parseInt(e.target.value) || 0})} />
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