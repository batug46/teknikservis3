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

    // Mevcut slider'ları sunucudan çeker
    const fetchSliders = async () => {
        try {
            const res = await fetch('/api/admin/slider');
            if (!res.ok) throw new Error('Sliderlar yüklenemedi.');
            const data = await res.json();
            setSliders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Sayfa ilk yüklendiğinde slider'ları çek
    useEffect(() => {
        fetchSliders();
    }, []);

    // Form gönderildiğinde yeni slider oluşturur
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !imageUrl) {
            setError('Başlık ve Resim URLsi alanları zorunludur.');
            return;
        }

        try {
            const res = await fetch('/api/admin/slider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, imageUrl, link }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Slider oluşturulamadı.');
            }

            setSuccess('Slider başarıyla oluşturuldu!');
            setTitle('');
            setImageUrl('');
            setLink('');
            await fetchSliders(); // Listeyi anında güncelle
        } catch (err) {
            setError(err.message);
        }
    };

    // Slider silme fonksiyonu
    const handleDelete = async (id) => {
        if (!confirm('Bu sliderı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
        
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`/api/admin/slider/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Slider silinemedi.');
            }
            setSuccess('Slider başarıyla silindi!');
            await fetchSliders(); // Listeyi anında güncelle
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Slider Yönetimi</h1>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Slider Başlığı</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">Resim URL</label>
                        <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="link" className="block text-gray-700 text-sm font-bold mb-2">Link (İsteğe Bağlı)</label>
                        <input type="text" id="link" value={link} onChange={(e) => setLink(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Kaydet
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mevcut Sliderlar</h2>
                {loading ? <p>Yükleniyor...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sliders.map((slider) => (
                            <div key={slider.id} className="border rounded-lg overflow-hidden shadow-lg">
                                <img src={slider.imageUrl} alt={slider.title} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{slider.title}</h3>
                                    {slider.link && <a href={slider.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800 text-sm break-all">{slider.link}</a>}
                                    <button onClick={() => handleDelete(slider.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs mt-4">
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 { !loading && sliders.length === 0 && <p className="text-gray-500">Henüz slider eklenmemiş.</p>}
            </div>
        </div>
    );
};

export default SliderAdminPage;