'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function BookAppointmentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    serviceType: searchParams.get('service') || '',
    description: '',
    date: '',
    time: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/book-appointment');
      return;
    }
  }, [status, router]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/products', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (!res.ok) throw new Error('Hizmetler yüklenemedi');
        const data = await res.json();
        const serviceProducts = data.filter(product => product.category === 'hizmet');
        setServices(serviceProducts);
        
        const urlService = searchParams.get('service');
        if (urlService && serviceProducts.some(service => service.name === urlService)) {
          setFormData(prev => ({ ...prev, serviceType: urlService }));
        }
      } catch (err) {
        console.error('Hizmetler yüklenirken hata:', err);
      }
    };

    fetchServices();
  }, []);

  // Seçilen tarihteki randevuları kontrol et
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.date) return;

      try {
        const res = await fetch(`/api/appointments/availability?date=${formData.date}`);
        const data = await res.json();
        setAvailableSlots(data);
      } catch (err) {
        console.error('Müsaitlik kontrolü yapılırken hata:', err);
      }
    };

    // Debounce ekleyelim - 500ms bekle
    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.date]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError(''); // Her değişiklikte hata mesajını temizle
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Randevu oluşturulamadı.');
      }
      
      setSuccess('Randevunuz başarıyla oluşturuldu!');
      setFormData({ serviceType: '', description: '', date: '', time: '', phone: '', address: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <LoadingState />;
  }

  if (status === 'unauthenticated') {
    return null; // useEffect zaten yönlendirme yapacak
  }

  // Saatleri oluştur
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Simple Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Teknik Servis Randevusu
          </h2>
          <p className="text-blue-100">
            Uzman ekibimizle randevunuzu oluşturun
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-white/20">
          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-3 bg-red-500/20 border border-red-400/30 text-red-100">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-3 bg-green-500/20 border border-green-400/30 text-green-100">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-200 mb-2">
                Servis Tipi
              </label>
                             <select
                 id="serviceType"
                 value={formData.serviceType}
                 onChange={handleChange}
                 required
                 className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               >
                 <option value="" className="text-gray-900">Seçiniz...</option>
                 {services.map(service => (
                   <option key={service.id} value={service.name} className="text-gray-900">
                     {service.name}
                   </option>
                 ))}
               </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
                Özel Notlar (İsteğe Bağlı)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Varsa özel notlarınızı buraya yazabilirsiniz..."
                className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                  Telefon Numaranız
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Telefon numaranızı girin"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-2">
                  Adresiniz
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Adresinizi girin"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-2">
                  Randevu Tarihi
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-200 mb-2">
                  Randevu Saati
                </label>
                                 <select
                   id="time"
                   value={formData.time}
                   onChange={handleChange}
                   required
                   className="block w-full pl-3 pr-3 py-3 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 >
                   <option value="" className="text-gray-900">Seçiniz...</option>
                   {timeSlots.map(time => {
                     const slotCount = availableSlots[time] || 0;
                     const isAvailable = slotCount < 2;
                     return (
                       <option
                         key={time}
                         value={time}
                         disabled={!isAvailable}
                         className={!isAvailable ? 'text-gray-400' : 'text-gray-900'}
                       >
                         {time} {!isAvailable ? '(Dolu)' : ''}
                       </option>
                     );
                   })}
                 </select>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Randevu Oluştur
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-white/20">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Yükleniyor...
            </h2>
            <p className="text-blue-100">
              Lütfen bekleyin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BookAppointmentForm />
    </Suspense>
  );
} 