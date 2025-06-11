# Teknik Servis Web Sitesi

Bu proje, teknik servis randevu yönetimi ve ürün satışı için geliştirilmiş bir web uygulamasıdır. Next.js, Bootstrap ve Prisma teknolojileri kullanılarak oluşturulmuştur.

## Özellikler

- 👤 Kullanıcı Yönetimi (Kayıt, Giriş, Profil)
- 📅 Randevu Sistemi
- 🛠 Teknik Servis Takibi
- 🛍 Ürün Satışı
- 👨‍💼 Admin Paneli
- 📱 Responsive Tasarım

## Teknolojiler

- Next.js 13+
- React
- Bootstrap 5
- Prisma (SQLite)
- JWT Authentication

## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone [repository-url]
   cd [proje-klasörü]
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Veritabanını oluşturun:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Çevre değişkenlerini ayarlayın:
   - `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
     ```
     DATABASE_URL="file:./dev.db"
     JWT_SECRET="your-secret-key"
     ```

5. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

6. Admin kullanıcısı oluşturun:
   - `http://localhost:3000/api/auth/create-admin` endpoint'ine POST isteği gönderin
   - Varsayılan admin bilgileri:
     - Email: admin@teknikservis.com
     - Şifre: admin123
   - **ÖNEMLİ**: Admin oluşturulduktan sonra güvenlik için `src/app/api/auth/create-admin` dosyasını silin

## Kullanım

- Web sitesi: `http://localhost:3000`
- Admin paneli: `http://localhost:3000/admin`

## Güvenlik Notları

1. Üretim ortamında güçlü bir JWT_SECRET kullanın
2. Admin oluşturma endpoint'ini devre dışı bırakın
3. Varsayılan admin şifresini değiştirin
4. `.env` dosyasını asla GitHub'a pushlamayın

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır. 