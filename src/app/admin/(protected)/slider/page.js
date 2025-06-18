'use client';

import { useState, useEffect } from 'react';

const SliderAdminPage = () => {
    const [sliders, setSliders] = useState([]);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

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
                body: JSON.stringify({ title: title.trim(), imageUrl: imageUrl.trim(), link: link.trim() || null }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Slider oluşturulamadı.');
            }

            setSuccess('Slider başarıyla oluşturuldu!');
            setTitle('');
            setImageUrl('');
            setLink('');
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

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Slider Yönetimi</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Yeni Slider Ekle</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Slider Başlığı</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">Resim URL</label>
                        <input
                            type="text"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={submitting}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="link" className="block text-gray-700 text-sm font-bold mb-2">Yönlendirilecek Link (İsteğe Bağlı)</label>
                        <input
                            type="text"
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            disabled={submitting}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? 'Kaydediliyor...' : 'Sliderı Kaydet'}
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mevcut Sliderlar</h2>
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    sliders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sliders.map((slider) => (
                                <div key={slider.id} className="border rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="relative h-40">
                                        <img
                                            src={slider.imageUrl}
                                            alt={slider.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                                e.target.alt = 'Resim yüklenemedi';
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 truncate">{slider.title}</h3>
                                        {slider.link && (
                                            <a
                                                href={slider.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-800 text-sm break-all block mb-3"
                                            >
                                                {slider.link}
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleDelete(slider.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Gösterilecek slider bulunamadı.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default SliderAdminPage;