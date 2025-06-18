import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Navbar from '../components/Navbar';
import Providers from './providers';

export const metadata = {
  title: 'Teknoloji Mağazası',
  description: 'En yeni teknoloji ürünleri uygun fiyatlarla',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <Providers>
          {/* STATİK NAVBAR KALDIRILDI, BİLEŞEN KULLANILIYOR */}
          <Navbar />
          <main className="container py-4">
            {children}
          </main>
          <footer className="bg-dark text-light py-4 mt-auto">
            <div className="container text-center">
              <p>&copy; 2025 Teknoloji Mağazası. Tüm hakları saklıdır.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
} 