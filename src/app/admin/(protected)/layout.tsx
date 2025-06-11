import Link from 'next/link';
import React from 'react';

// Bu şablon, SADECE korumalı admin sayfalarını çevreleyecektir.
export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* === ADMİN SIDEBAR === */}
        <div className="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse vh-100">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin">
                  <i className="bi bi-house-door me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/products">
                  <i className="bi bi-box me-2"></i>
                  Ürünler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-white" href="/admin/orders">
                  <i className="bi bi-cart me-2"></i>
                  Siparişler
                </Link>
              </li>
              {/* Diğer admin linkleri... */}
            </ul>
          </div>
        </div>

        {/* === ANA İÇERİK === */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}