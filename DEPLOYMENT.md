# 🚀 Production Deployment Rehberi

## 📋 Gereksinimler

### 1. **Sunucu Gereksinimleri**
- **OS**: Ubuntu 20.04+ veya CentOS 8+
- **RAM**: Minimum 2GB (4GB önerilen)
- **CPU**: 2 çekirdek
- **Disk**: 20GB boş alan
- **Domain**: SSL sertifikalı domain

### 2. **Yazılım Gereksinimleri**
- Node.js 18+
- PostgreSQL 13+
- Nginx
- PM2 (Process Manager)
- Git

## 🔧 Kurulum Adımları

### 1. **Sunucu Hazırlığı**

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget git nginx postgresql postgresql-contrib

# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2
```

### 2. **PostgreSQL Kurulumu**

```bash
# PostgreSQL servisini başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL kullanıcısına geç
sudo -u postgres psql

# Veritabanı oluştur
CREATE DATABASE teknik_servis_db;
CREATE USER teknik_user WITH PASSWORD 'güvenli_şifre';
GRANT ALL PRIVILEGES ON DATABASE teknik_servis_db TO teknik_user;
\q
```

### 3. **Proje Kurulumu**

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www/teknik-servis
sudo chown $USER:$USER /var/www/teknik-servis

# Projeyi klonla
cd /var/www/teknik-servis
git clone https://github.com/kullanici/teknik-servis.git .

# Bağımlılıkları yükle
npm install

# Production build
npm run build
```

### 4. **Environment Variables**

```bash
# .env dosyası oluştur
sudo nano .env
```

```env
# Database
DATABASE_URL="postgresql://teknik_user:güvenli_şifre@localhost:5432/teknik_servis_db"

# NextAuth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-here-change-this"

# Email (SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Admin User
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"

# Production Settings
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 5. **Veritabanı Migration**

```bash
# Prisma migration
npx prisma migrate deploy
npx prisma generate

# Seed data (opsiyonel)
npm run seed
```

### 6. **PM2 Konfigürasyonu**

```bash
# ecosystem.config.js oluştur
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'teknik-servis',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/teknik-servis',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

### 7. **Nginx Konfigürasyonu**

```bash
# Nginx config oluştur
sudo nano /etc/nginx/sites-available/teknik-servis
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Sertifikası
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Güvenlik Ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Gzip Sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Proxy Ayarları
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Nginx config'i etkinleştir
sudo ln -s /etc/nginx/sites-available/teknik-servis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. **SSL Sertifikası (Let's Encrypt)**

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme
sudo crontab -e
# Aşağıdaki satırı ekle:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 9. **Firewall Ayarları**

```bash
# UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 10. **Uygulamayı Başlat**

```bash
# PM2 ile başlat
pm2 start ecosystem.config.js

# PM2 startup script
pm2 startup
pm2 save
```

## 🔍 Monitoring ve Logs

### PM2 Monitoring
```bash
# Uygulama durumu
pm2 status

# Logları görüntüle
pm2 logs teknik-servis

# Monitoring dashboard
pm2 monit
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Güncelleme Süreci

```bash
# Projeyi güncelle
cd /var/www/teknik-servis
git pull origin main

# Bağımlılıkları güncelle
npm install

# Build
npm run build

# PM2 restart
pm2 restart teknik-servis
```

## 🛡️ Güvenlik Kontrol Listesi

- [ ] SSL sertifikası aktif
- [ ] Firewall yapılandırıldı
- [ ] Güçlü şifreler kullanıldı
- [ ] Environment variables güvenli
- [ ] Database backup sistemi
- [ ] Monitoring aktif
- [ ] Log rotation yapılandırıldı

## 📊 Performance Optimizasyonu

### Nginx Optimizasyonu
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

### Node.js Optimizasyonu
```bash
# PM2 cluster mode
pm2 start ecosystem.config.js --instances max
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

1. **Port 3000 erişilemiyor**
   ```bash
   sudo netstat -tlnp | grep :3000
   pm2 restart teknik-servis
   ```

2. **Database bağlantı hatası**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "\l"
   ```

3. **SSL sertifikası sorunu**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

## 📞 Destek

Sorun yaşarsanız:
1. PM2 logs kontrol edin
2. Nginx error logs kontrol edin
3. Database bağlantısını test edin
4. Environment variables kontrol edin 