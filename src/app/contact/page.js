'use client';

import React, { useState } from 'react';
import { 
  Mail, User, MessageSquare, Send, MapPin, Phone, Clock, 
  CheckCircle, XCircle, AlertCircle, Building2, Globe, Calendar 
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mesaj gönderilemedi.');
      
      setStatus({ type: 'success', text: 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.' });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Formu temizle
    } catch (err) {
      setStatus({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Alert Component
  const MessageAlert = ({ status }) => {
    if (!status.text) return null;

    const alertConfig = {
      success: { 
        bg: 'bg-green-50 dark:bg-green-900/20', 
        border: 'border-green-200 dark:border-green-800', 
        text: 'text-green-800 dark:text-green-200', 
        icon: CheckCircle 
      },
      danger: { 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        border: 'border-red-200 dark:border-red-800', 
        text: 'text-red-800 dark:text-red-200', 
        icon: XCircle 
      },
      warning: { 
        bg: 'bg-yellow-50 dark:bg-yellow-900/20', 
        border: 'border-yellow-200 dark:border-yellow-800', 
        text: 'text-yellow-800 dark:text-yellow-200', 
        icon: AlertCircle 
      }
    };

    const config = alertConfig[status.type] || alertConfig.warning;
    const Icon = config.icon;

    return (
      <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-6`}>
        <div className="flex items-start">
          <Icon className={`w-5 h-5 ${config.text} mr-3 mt-0.5`} />
          <div className={config.text}>{status.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">İletişime Geçin</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Sorularınız, önerileriniz veya teknik destek talepleriniz için bizimle iletişime geçebilirsiniz. 
          Size en kısa sürede dönüş yapacağız.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Mesaj Gönder</h2>
          </div>

          <MessageAlert status={status} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ad Soyad *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Adınızı ve soyadınızı girin"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  E-posta Adresi *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Konu *
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Mesajınızın konusunu belirtin"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mesajınız *
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-none"
                placeholder="Mesajınızı detaylı olarak yazın..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Mesajı Gönder
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Company Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Building2 className="w-6 h-6 mr-3 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">İletişim Bilgileri</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Adres</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Efe Bilgisayar ve Güvenlik Sistemleri
                    <br />
                    Örnek Mahallesi, Teknoloji Caddesi No:123
                    <br />
                    Çankaya/Ankara
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Telefon</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="tel:+905555555555" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      +90 555 555 5555
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">E-posta</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href="mailto:info@efebilgisayar.com" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      info@efebilgisayar.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 mr-3 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Çalışma Saatleri</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">Pazartesi - Cuma</span>
                <span className="text-gray-600 dark:text-gray-300">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="font-medium text-gray-900 dark:text-white">Cumartesi</span>
                <span className="text-gray-600 dark:text-gray-300">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-900 dark:text-white">Pazar</span>
                <span className="text-red-600 dark:text-red-400 font-medium">Kapalı</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">Randevu Sistemimiz</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Daha hızlı hizmet alabilmek için online randevu sisteminizi kullanabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Globe className="w-6 h-6 mr-3 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Hizmetlerimiz</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Teknik Servis</h4>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Güvenlik Sistemleri</h4>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Bilgisayar Satışı</h4>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-orange-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">Danışmanlık</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Hızlı Destek İçin</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Acil teknik destek gereksinimi için doğrudan telefon ile iletişime geçebilir 
          veya WhatsApp üzerinden bize ulaşabilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+905555555555"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <Phone className="w-5 h-5 mr-2" />
            Hemen Ara
          </a>
          <a
            href="https://wa.me/905555555555"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
} 