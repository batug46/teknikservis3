# PostgreSQL Kurulumu Sonrası Adımlar

## 1. PostgreSQL Kurulduktan Sonra:

# pgAdmin'den veya komut satırından veritabanı oluşturun:
createdb -U postgres teknikservis

# Veya SQL komutu ile:
# CREATE DATABASE teknikservis;

## 2. .env dosyasında şifreyi güncelleyin:
# DATABASE_URL="postgresql://postgres:SIFRENIZ@localhost:5432/teknikservis"
# Örnek: DATABASE_URL="postgresql://postgres:123456@localhost:5432/teknikservis"

## 3. Prisma komutlarını çalıştırın:
npm install
npx prisma generate
npx prisma db push
npx prisma db seed

## 4. Uygulamayı çalıştırın:
npm run dev