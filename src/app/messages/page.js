'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState({ recipientId: '', subject: '', body: '' });

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const url = activeTab === 'inbox' ? '/api/messages' : '/api/messages/sent';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Mesajlar çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  const openNewMessageModal = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
      setShowModal(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
    });
    setShowModal(false);
    setActiveTab('sent');
  };

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-3">
          <button className="btn btn-primary w-100 mb-3" onClick={openNewMessageModal}>
            Yeni Mesaj Oluştur
          </button>
          <div className="list-group">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              Gelen Kutusu
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Giden Kutusu
            </button>
          </div>
        </div>
        <div className="col-md-9">
          {loading ? <p>Yükleniyor...</p> : (
            <div className="list-group">
              {messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{msg.subject}</h5>
                    <small>{new Date(msg.createdAt).toLocaleString()}</small>
                  </div>
                  <p className="mb-1">{msg.body}</p>
                  <small className="text-muted">
                    {activeTab === 'inbox' 
                      ? `Gönderen: ${msg.sender?.name || 'Bilinmeyen Kullanıcı'}` 
                      : `Alıcı: ${msg.recipient?.name || 'Bilinmeyen Kullanıcı'}`
                    }
                  </small>
                </div>
              )) : <p>Gösterilecek mesaj yok.</p>}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form onSubmit={handleSendMessage}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Yeni Mesaj</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Alıcı</label>
                    <select className="form-select" value={newMessage.recipientId} onChange={e => setNewMessage({...newMessage, recipientId: e.target.value})} required>
                      <option value="">Kullanıcı Seçin...</option>
                      {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Konu</label>
                    <input type="text" className="form-control" value={newMessage.subject} onChange={e => setNewMessage({...newMessage, subject: e.target.value})} required/>
                  </div>
                   <div className="mb-3">
                    <label className="form-label">Mesaj</label>
                    <textarea className="form-control" rows={5} value={newMessage.body} onChange={e => setNewMessage({...newMessage, body: e.target.value})} required></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Kapat</button>
                  <button type="submit" className="btn btn-primary">Gönder</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 