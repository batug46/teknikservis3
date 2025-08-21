'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const sendTestEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/test-email-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Email başarıyla gönderildi! Message ID: ${data.messageId}`);
      } else {
        setResult(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Doğrulama emaili gönderildi!`);
      } else {
        setResult(`❌ Hata: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Email Test</h1>
      
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email adresi girin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        
        <div className="space-y-2">
          <button
            onClick={sendTestEmail}
            disabled={loading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Gönderiliyor...' : 'Test Emaili Gönder'}
          </button>
          
          <button
            onClick={sendVerificationEmail}
            disabled={loading || !email}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Gönderiliyor...' : 'Doğrulama Emaili Gönder'}
          </button>
        </div>
        
        {result && (
          <div className={`p-3 rounded-md ${result.includes('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
            {result}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <h3 className="font-semibold mb-2">Mevcut Email Ayarları:</h3>
        <div className="space-y-1">
          <p><strong>Host:</strong> smtp-relay.brevo.com</p>
          <p><strong>Port:</strong> 587</p>
          <p><strong>User:</strong> gbatu4242@gmail.com</p>
          <p><strong>Master Password:</strong> {'●'.repeat(12)}</p>
        </div>
      </div>
    </div>
  );
}
