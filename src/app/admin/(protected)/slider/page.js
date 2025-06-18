'use client';

import { useState, useEffect } from 'react';

const SliderPage = () => {
    const [sliders, setSliders] = useState([]);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSliders = async () => {
        try {
            const res = await fetch('/api/admin/slider');
            if (!res.ok) {
                throw new Error('Sliderlar yüklenemedi');
            }
            const data = await res.json();
            setSliders(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !imageUrl) {
            setError('Başlık ve Resim URLsi zorunludur.');
            return;
        }

        try {
            const res = await fetch('/api/admin/slider', {
                method: 'POST',
                // BU KISIM EKSİKTİ VE 500 HATASINA NEDEN OLUYORDU
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, imageUrl, link }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Slider oluşturulamadı');
            }

            setSuccess('Slider başarıyla oluşturuldu!');
            setTitle('');
            setImageUrl('');
            setLink('');
            // Yeni slider eklendikten sonra listeyi hemen güncelle
            fetchSliders();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Bu sliderı silmek istediğinizden emin misiniz?')) {
            try {
                const res = await fetch(`/api/admin/slider/${id}`, {
                    method: 'DELETE',
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Slider silinemedi');
                }
                setSuccess('Slider başarıyla silindi!');
                // Slider silindikten sonra listeyi hemen güncelle
                fetchSliders();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Slider Yönetimi</h1>

            {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-2 mb-4 rounded">{success}</p>}

            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Başlık</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Resim URL</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Link (İsteğe Bağlı)</label>
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Kaydet
                </button>
            </form>

            <h2 className="text-xl font-bold mb-4">Mevcut Sliderlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sliders.map((slider) => (
                    <div key={slider.id} className="border rounded p-4 shadow">
                        <img src={slider.imageUrl} alt={slider.title} className="w-full h-32 object-cover mb-2 rounded" />
                        <h3 className="font-semibold">{slider.title}</h3>
                        {slider.link && <a href={slider.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm break-all">{slider.link}</a>}
                        <button
                            onClick={() => handleDelete(slider.id)}
                            className="mt-2 w-full bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                        >
                            Sil
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SliderPage;