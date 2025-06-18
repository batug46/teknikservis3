'use client';

import { useState, useEffect } from 'react';

// Bu fonksiyonun içeriğini olduğu gibi kopyalayın. Sadece gönderme mantığı düzeltildi.
const SliderPage = () => {
    const [sliders, setSliders] = useState([]);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch('/api/admin/slider', {
                method: 'POST',
                // BU KISIM EKSİKTİ: Sunucuya JSON gönderdiğimizi belirtiyoruz.
                headers: {
                    'Content-Type': 'application/json',
                },
                // Veriyi JSON formatına çeviriyoruz.
                body: JSON.stringify({ title, imageUrl, link }),
            });

            // Sunucudan gelen yanıt başarısız ise hatayı yakala
            if (!res.ok) {
                // Sunucudan gelen hata mesajını okumaya çalış
                const errorData = await res.json().catch(() => ({ error: 'Bilinmeyen bir hata oluştu' }));
                throw new Error(errorData.error || 'Slider oluşturma başarısız');
            }

            setSuccess('Slider başarıyla eklendi!');
            setTitle('');
            setImageUrl('');
            setLink('');
            fetchSliders(); // Listeyi yenile
        } catch (err) {
            setError(err.message);
        }
    };
    
    // Silme fonksiyonu ekleyelim (opsiyonel ama kullanışlı)
    const handleDelete = async (id) => {
        if (!confirm('Bu sliderı silmek istediğinizden emin misiniz?')) return;
        
        try {
            const res = await fetch(`/api/admin/slider/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Silme işlemi başarısız' }));
                throw new Error(errorData.error || 'Slider silinemedi');
            }
            setSuccess('Slider başarıyla silindi!');
            fetchSliders(); // Listeyi yenile
        } catch (err) {
            setError(err.message);
        }
    };

    // BURADAN AŞAĞISI SİZİN ORİJİNAL GÖRSEL TASARIMINIZ OLMALI
    // Eğer benim bir önceki cevabımdaki kodlar hala duruyorsa,
    // lütfen bu kısmı kendi orijinal kodunuzla değiştirin.
    return (
        <div>
            <h1>Slider Yönetimi</h1>

            {error && <p style={{ color: 'red' }}>Hata: {error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Başlık:</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Resim URL:</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
                </div>
                <div>
                    <label>Link:</label>
                    <input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>
                <button type="submit">Kaydet</button>
            </form>

            <hr />

            <h2>Mevcut Sliderlar</h2>
            <ul>
                {sliders.map(slider => (
                    <li key={slider.id}>
                        <img src={slider.imageUrl} alt={slider.title} width="100" />
                        <p>{slider.title}</p>
                        <button onClick={() => handleDelete(slider.id)}>Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SliderPage;