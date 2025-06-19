'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SliderAdminPage = () => {
    const [sliders, setSliders] = useState([]);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const fetchSliders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/slider', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Sliderlar yüklenemedi.');
            }
            
            const data = await res.json();
            setSliders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Slider fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessages();

        if (!title.trim() || !imageUrl.trim()) {
            setError('Başlık ve Resim URLsi alanları zorunludur.');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch('/api/admin/slider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: title.trim(), 
                    imageUrl: imageUrl.trim(), 
                    link: link.trim() || null 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Slider oluşturulamadı.');
            }

            setSuccess('Slider başarıyla oluşturuldu!');
            setTitle('');
            setImageUrl('');
            setLink('');
            setPreviewImage('');
            await fetchSliders();
        } catch (err) {
            console.error('Slider creation error:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu sliderı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
        clearMessages();

        try {
            const res = await fetch(`/api/admin/slider/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Slider silinemedi.');
            }

            setSuccess('Slider başarıyla silindi!');
            await fetchSliders();
        } catch (err) {
            console.error('Slider deletion error:', err);
            setError(err.message);
        }
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sol Taraf - Form */}
                <div className="md:w-1/3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold mb-6">Yeni Slider Ekle</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slider Başlığı
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                    placeholder="Slider başlığını girin"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resim URL
                                </label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => {
                                        setImageUrl(e.target.value);
                                        setPreviewImage(e.target.value);
                                    }}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                    placeholder="Resim URL'sini girin"
                                />
                                {previewImage && (
                                    <div className="mt-2 relative h-40 rounded-md overflow-hidden">
                                        <img
                                            src={previewImage}
                                            alt="Önizleme"
                                            className="w-full h-full object-cover"
                                            onError={() => setPreviewImage('')}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link (İsteğe bağlı)
                                </label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                    placeholder="Link girin (opsiyonel)"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
                                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? 'Ekleniyor...' : 'Slider Ekle'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sağ Taraf - Slider Listesi */}
                <div className="md:w-2/3">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Slider Listesi</h2>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 bg-green-100 border-l-4 border-green-500 p-4">
                                <p className="text-green-700">{success}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sliders.map((slider) => (
                                    <div key={slider.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                                        <div className="aspect-w-16 aspect-h-9 relative">
                                            <img
                                                src={slider.imageUrl}
                                                alt={slider.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-2">{slider.title}</h3>
                                            {slider.link && (
                                                <a
                                                    href={slider.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm block mb-2 truncate"
                                                >
                                                    {slider.link}
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(slider.id)}
                                                className="mt-2 w-full px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && sliders.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Henüz slider eklenmemiş.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SliderAdminPage;