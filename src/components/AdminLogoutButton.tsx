'use client';
import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem('user');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/'); // Çıkış yapınca ana sayfaya yönlendir
    router.refresh(); // Sunucu tarafındaki durumu yenile
  };

  return (
    <button className="nav-link text-white btn btn-link w-100 text-start" onClick={handleLogout}>
      <i className="bi bi-box-arrow-right me-2"></i>
      Çıkış Yap
    </button>
  );
}
