'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  if (loading) return <div>Mesajlar yükleniyor...</div>;

  return (
    <>
      <h1 className="h2 pt-3 pb-2 mb-3 border-bottom">İletişim Mesajları</h1>
      <div className="list-group">
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.id} className="list-group-item list-group-item-action flex-column align-items-start">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">{msg.name}</h5>
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
            </div>
            <p className="mb-1">{msg.message}</p>
            <small className="text-muted">{msg.email}</small>
          </div>
        )) : <p>Gösterilecek mesaj bulunmuyor.</p>}
      </div>
    </>
  );
}