'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz doğrulama linki');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email adresiniz başarıyla doğrulandı!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Doğrulama başarısız');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Bir hata oluştu');
    }
  };

  const resendVerification = async () => {
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: localStorage.getItem('pendingEmail') })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Doğrulama emaili tekrar gönderildi');
      } else {
        setStatus('error');
        setMessage(data.error || 'Email gönderilemedi');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Email Doğrulama
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Email doğrulanıyor...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Başarılı!
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Hata!
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {message}
              </p>
              <div className="mt-6">
                <button
                  onClick={resendVerification}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tekrar Gönder
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Giriş Sayfasına Git
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 