'use client';

import { useEffect } from 'react';

export default function Providers({ children }) {
  useEffect(() => {
    // Bootstrap JS'yi dinamik olarak yükle
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return children;
} 