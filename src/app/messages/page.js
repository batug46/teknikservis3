'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, Plus, Inbox, Send, User, Calendar, X, 
  Mail, Search, Archive, Trash2, Reply, Forward, MoreHorizontal,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState({ recipientId: '', subject: '', body: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const url = activeTab === 'inbox' ? '/api/messages' : '/api/messages/sent';
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Sayıları güncelle
        if (activeTab === 'inbox') {
          setUnreadCount(data.filter(m => !m.isRead).length);
        } else {
          setSentCount(data.length);
        }
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

  // Sayıları almak için her iki API'yi de çağır
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Gelen kutusu sayısı
        const inboxRes = await fetch('/api/messages');
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          setUnreadCount(inboxData.filter(m => !m.isRead).length);
        }

        // Giden kutusu sayısı  
        const sentRes = await fetch('/api/messages/sent');
        if (sentRes.ok) {
          const sentData = await sentRes.json();
          setSentCount(sentData.length);
        }
      } catch (error) {
        console.error("Sayılar alınırken hata:", error);
      }
    };

    fetchCounts();
  }, []);
  
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
    setNewMessage({ recipientId: '', subject: '', body: '' });
    setActiveTab('sent');
    
    // Giden kutusu sayısını artır
    setSentCount(prev => prev + 1);
    
    fetchMessages();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activeTab === 'inbox' ? msg.sender?.name : msg.recipient?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMessageIcon = (msg) => {
    if (activeTab === 'inbox') {
      return msg.isRead ? <Mail className="w-5 h-5 text-gray-400" /> : <Mail className="w-5 h-5 text-blue-600" />;
    } else {
      return <Send className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mesajlarım</h1>
        </div>
        <button 
          onClick={openNewMessageModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Mesaj
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Klasörler</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'inbox' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Inbox className="w-5 h-5 mr-3" />
                <span>Gelen Kutusu</span>
                <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                  activeTab === 'inbox' ? 'bg-white text-blue-600' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                }`}>
                  {unreadCount}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('sent')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'sent' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                <Send className="w-5 h-5 mr-3" />
                <span>Giden Kutusu</span>
                <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                  activeTab === 'sent' ? 'bg-white text-green-600' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                }`}>
                  {sentCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Search Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Mesajlarda ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Messages Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  {activeTab === 'inbox' ? (
                    <>
                      <Inbox className="w-5 h-5 mr-2 text-blue-600" />
                      Gelen Kutusu ({filteredMessages.length})
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 text-green-600" />
                      Giden Kutusu ({filteredMessages.length})
                    </>
                  )}
                </h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Archive className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Mesajlar yükleniyor...</span>
                </div>
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                      activeTab === 'inbox' && !msg.isRead ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => setSelectedMessage(selectedMessage === msg.id ? null : msg.id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getMessageIcon(msg)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className={`text-sm font-medium ${
                              activeTab === 'inbox' && !msg.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {activeTab === 'inbox' 
                                ? msg.sender?.name || 'Bilinmeyen Kullanıcı'
                                : msg.recipient?.name || 'Bilinmeyen Kullanıcı'
                              }
                            </h3>
                            {activeTab === 'inbox' && !msg.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(msg.createdAt)}</span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className={`text-sm mb-1 ${
                          activeTab === 'inbox' && !msg.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
                        }`}>
                          {msg.subject}
                        </h4>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {msg.body}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Message Content */}
                    {selectedMessage === msg.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {activeTab === 'inbox' 
                                    ? msg.sender?.name || 'Bilinmeyen Kullanıcı'
                                    : msg.recipient?.name || 'Bilinmeyen Kullanıcı'
                                  }
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(msg.createdAt).toLocaleString('tr-TR')}
                                </div>
                              </div>
                            </div>
                            
                            {activeTab === 'inbox' && (
                              <div className="flex space-x-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <Reply className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <Forward className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {msg.body}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz mesaj yok'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? 'Farklı anahtar kelimeler deneyebilirsiniz.'
                      : activeTab === 'inbox' 
                        ? 'Gelen kutunuzda henüz mesaj bulunmuyor.'
                        : 'Henüz gönderdiğiniz mesaj bulunmuyor.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSendMessage}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Yeni Mesaj Oluştur
                </h3>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alıcı *
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    value={newMessage.recipientId} 
                    onChange={e => setNewMessage({...newMessage, recipientId: e.target.value})} 
                    required
                  >
                    <option value="">Kullanıcı seçin...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Konu *
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    value={newMessage.subject} 
                    onChange={e => setNewMessage({...newMessage, subject: e.target.value})} 
                    placeholder="Mesaj konusunu girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mesaj *
                  </label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors h-32 resize-none"
                    value={newMessage.body} 
                    onChange={e => setNewMessage({...newMessage, body: e.target.value})} 
                    placeholder="Mesajınızı yazın..."
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <button 
                  type="button" 
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 