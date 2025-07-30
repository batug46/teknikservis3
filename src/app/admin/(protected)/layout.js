'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Users,
  Package,
  Calendar,
  MessageSquare,
  LayoutTemplate,
  LogOut,
  ShoppingCart,
  Contact,
  Star,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import AdminLogoutButton from '../../../components/AdminLogoutButton';

const NavLink = ({ href, children, icon: Icon, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200 ${isActive ? 'bg-gray-900 text-white' : ''}`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{children}</span>
    </Link>
  );
};

export default function ProtectedAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col p-4 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
          <div className="text-2xl font-bold text-center flex-1">
            Admin Paneli
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-2 flex-1">
          <NavLink href="/admin" icon={Home} onClick={closeSidebar}>Dashboard</NavLink>
          <NavLink href="/admin/users" icon={Users} onClick={closeSidebar}>Kullanıcılar</NavLink>
          <NavLink href="/admin/orders" icon={ShoppingCart} onClick={closeSidebar}>Siparişler</NavLink>
          <NavLink href="/admin/returns" icon={RefreshCw} onClick={closeSidebar}>İade Talepleri</NavLink>
          <NavLink href="/admin/appointments" icon={Calendar} onClick={closeSidebar}>Randevular</NavLink>
          <NavLink href="/admin/contact" icon={Contact} onClick={closeSidebar}>İletişim Mesajları</NavLink>
          <NavLink href="/admin/slider" icon={LayoutTemplate} onClick={closeSidebar}>Slider Yönetimi</NavLink>
          <NavLink href="/admin/products" icon={Package} onClick={closeSidebar}>Ürün Yönetimi</NavLink>
        </nav>
        
        <div className="mt-auto">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-gray-800 text-white p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Admin Paneli</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0 bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 