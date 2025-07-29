'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, XCircle, CheckCircle, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import Link from 'next/link';
import DeleteUserModal from '../../../../components/DeleteUserModal';

const FeedbackBanner = ({ type, message, onDismiss }) => {
  if (!message) return null;

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-100' : 'bg-green-100';
  const borderColor = isError ? 'border-red-400' : 'border-green-400';
  const textColor = isError ? 'text-red-700' : 'text-green-700';
  const Icon = isError ? XCircle : CheckCircle;

  return (
    <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded-md relative mb-4`} role="alert">
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        <span className="block sm:inline">{message}</span>
      </div>
      <button onClick={onDismiss} className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <XCircle className={`h-6 w-6 ${textColor}`} />
      </button>
    </div>
  );
};

const UserRow = ({ user, onRoleChange, onDeleteRequest }) => {
  const isProtectedAdmin = user.email === 'admin@teknikservis.com';

  const handleActionChange = (e) => {
    const action = e.target.value;
    e.target.value = ''; // Reset dropdown
    
    if (action === 'change-role') {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      onRoleChange(user.id, newRole);
    } else if (action === 'delete') {
      onDeleteRequest(user.id);
    }
  };

  return (
    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{user.id}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{user.adSoyad || 'Belirtilmemiş'}</td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.phone || 'Belirtilmemiş'}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <select 
          onChange={handleActionChange} 
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          disabled={isProtectedAdmin}
        >
          <option value="">İşlem Seç</option>
          <option value="change-role">
            {user.role === 'admin' ? 'Kullanıcı Yap' : 'Admin Yap'}
          </option>
          <option value="delete">Sil</option>
        </select>
      </td>
    </tr>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: null, message: null });
  const [userToDelete, setUserToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Kullanıcıları filtreleme ve sıralama
  useEffect(() => {
    let filtered = [...users];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.adSoyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rol filtresi
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.adSoyad || '').localeCompare(b.adSoyad || '', 'tr');
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email, 'tr');
          break;
        case 'id':
          comparison = a.id - b.id;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    setFeedback({ type: null, message: null });
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error("Kullanıcılar yüklenemedi.");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setFeedback({ type: null, message: null });
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
       const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rol değiştirilemedi.");
      
      setFeedback({ type: 'success', message: 'Rol başarıyla güncellendi!' });
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDeleteRequest = (userId) => {
    setUserToDelete(userId);
    setIsModalOpen(true);
  };
  
  const handleConfirmDelete = async (userId) => {
    setIsModalOpen(false);
    setFeedback({ type: null, message: null });
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Kullanıcı silinemedi.");
      }
      
      setFeedback({ type: 'success', message: data.message || 'Kullanıcı başarıyla silindi!' });
      await fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUserToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setSortBy('id');
    setSortOrder('asc');
  };

  return (
    <>
      <DeleteUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
      <div className="space-y-6">
        <FeedbackBanner 
          type={feedback.type} 
          message={feedback.message} 
          onDismiss={() => setFeedback({ type: null, message: null })} 
        />
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Kullanıcı Yönetimi</h1>
          <Link href="/admin/users/new" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
            <PlusCircle className="w-5 h-5 mr-2" />
            Yeni Kullanıcı
          </Link>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="İsim, email veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            {/* Rol Filtresi */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">Tüm Roller</option>
                <option value="admin">Admin</option>
                <option value="user">Kullanıcı</option>
              </select>
            </div>

            {/* Sıralama */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="id">ID'ye Göre</option>
                <option value="name">İsme Göre</option>
                <option value="email">Email'e Göre</option>
              </select>
            </div>

            {/* Sıralama Yönü ve Temizle */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                title={sortOrder === 'asc' ? 'Artan' : 'Azalan'}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
              {(searchTerm || roleFilter !== 'all' || sortBy !== 'id' || sortOrder !== 'asc') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Sonuç Sayısı */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {filteredUsers.length} kullanıcı bulundu
          </div>
        </div>
        
        {loading && <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>}
        
        {!loading && (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">İsim</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Telefon</th>
                  <th scope="col" className="px-6 py-3">Rol</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <UserRow key={user.id} user={user} onRoleChange={handleRoleChange} onDeleteRequest={handleDeleteRequest} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all' ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.' : 'Hiç kullanıcı bulunamadı.'}
            </h3>
            {(searchTerm || roleFilter !== 'all') && (
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
    </>
  );
} 