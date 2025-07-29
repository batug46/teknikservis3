'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Mail, User, Clock, Trash2, Eye, EyeOff, Calendar, Search, SortAsc, SortDesc, X } from 'lucide-react';

export default function AdminContactMessagesPage() {
  const [allMessages, setAllMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [readFilter, setReadFilter] = useState('all'); // all, read, unread
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtreleme ve sıralama işlemi
  useEffect(() => {
    let filtered = [...allMessages];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(message => 
        message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Okundu/Okunmadı filtresi
    if (readFilter !== 'all') {
      filtered = filtered.filter(message => {
        if (readFilter === 'read') {
          return message.read === true;
        } else if (readFilter === 'unread') {
          return message.read === false;
        }
        return true;
      });
    }

    // Tarih filtresi
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(message => {
        const messageDate = new Date(message.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return messageDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return messageDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return messageDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'sender':
          comparison = (a.name || '').localeCompare(b.name || '', 'tr');
          break;
        case 'subject':
          comparison = (a.subject || '').localeCompare(b.subject || '', 'tr');
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '', 'tr');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMessages(filtered);
  }, [allMessages, searchTerm, readFilter, dateFilter, sortBy, sortOrder]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const data = await res.json();
        setAllMessages(data);
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleDelete = async (messageId) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeleting(messageId);
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAllMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
    } finally {
      setDeleting(null);
    }
  };

  const markAsRead = async (messageId, read = true) => {
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read })
      });

      if (res.ok) {
        setAllMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, read } : msg
          )
        );
      }
    } catch (error) {
      console.error('Mesaj durumu güncellenirken hata:', error);
    }
  };

  const openMessageDetail = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    // Mesajı okundu olarak işaretle
    if (!message.read) {
      markAsRead(message.id, true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setReadFilter('all');
    setDateFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Mesajlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900">
              İletişim Mesajları
            </h1>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {allMessages.length}/{allMessages.length} mesaj
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Arama */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Gönderen, email, konu veya mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
          </div>

          {/* Okundu Filtresi */}
          <div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">Tüm Mesajlar</option>
              <option value="unread">Okunmamış</option>
              <option value="read">Okunmuş</option>
            </select>
          </div>

          {/* Tarih Filtresi */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">Tüm Tarihler</option>
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
            </select>
          </div>

          {/* Sıralama ve Temizle */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="date">Tarihe Göre</option>
              <option value="sender">Gönderene Göre</option>
              <option value="subject">Konuya Göre</option>
              <option value="email">Email'e Göre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Temizle Butonu ve Sonuç Sayısı */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredMessages.length} mesaj bulundu
          </div>
          {(searchTerm || readFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Mesajlar Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gönderen</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Konu</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.map((message) => (
                <tr key={message.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${!message.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {message.read ? (
                        <Eye className="w-4 h-4 text-gray-400" />
                      ) : (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {message.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {message.subject}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {message.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openMessageDetail(message)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        title="Mesaj detaylarını görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        disabled={deleting === message.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Boş Durum */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchTerm || readFilter !== 'all' || dateFilter !== 'all' 
                ? 'Arama kriterlerinize uygun mesaj bulunamadı.' 
                : 'Henüz mesaj bulunmuyor.'}
            </h3>
            {(searchTerm || readFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Filtreleri temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mesaj Detay Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Mesaj Detayları
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Gönderen
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedMessage.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedMessage.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Konu
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Mesaj
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tarih
                  </label>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    handleDelete(selectedMessage.id);
                    closeModal();
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
                >
                  Sil
                </button>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 