import Link from 'next/link';
import React from 'react';
import AdminLogoutButton from '../../../components/AdminLogoutButton';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse vh-100">
          <div className="position-sticky pt-3 d-flex flex-column h-100">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin">
                  <i className="bi bi-house-door me-2"></i>Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/users">
                  <i className="bi bi-people me-2"></i>Kullanıcılar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/orders">
                  <i className="bi bi-receipt me-2"></i>Siparişler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/appointments">
                  <i className="bi bi-calendar me-2"></i>Randevular
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/contact">
                  <i className="bi bi-envelope me-2"></i>Mesajlar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/slider">
                  <i className="bi bi-images me-2"></i>Slider Yönetimi
                </Link>
              </li>
              {/* YENİ EKLENEN LİNK */}
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/products">
                  <i className="bi bi-box-seam me-2"></i>Ürün Yönetimi
                </Link>
              </li>
            </ul>
            <ul className="nav flex-column mt-auto mb-3">
              <li className="nav-item"><AdminLogoutButton /></li>
            </ul>
          </div>
        </div>
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}
