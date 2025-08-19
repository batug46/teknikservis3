# 🚀 Otomatik Deployment Kurulumu

Bu döküman GitHub Actions ile otomatik deployment kurulumunu anlatır.

## 📋 Önkoşullar

- ✅ VPS sunucu (Ubuntu 22.04)
- ✅ Node.js 18+ kurulu
- ✅ PM2 kurulu
- ✅ PostgreSQL kurulu
- ✅ Nginx kurulu
- ✅ SSL sertifikası (Let's Encrypt)

## 🔧 Sunucu Kurulumu

### 1. SSH Key Oluşturma (Sunucuda)

```bash
# GitHub için SSH key oluştur
ssh-keygen -t ed25519 -C "tekniverse-server"

# Public key'i GitHub'a ekle
cat ~/.ssh/id_ed25519.pub

# Private key'i GitHub Actions için kopyala
cat ~/.ssh/id_ed25519
```

### 2. Proje Dizini Oluşturma

```bash
# Web dizini oluştur
sudo mkdir -p /var/www/tekniverse.xyz
sudo chown $USER:$USER /var/www/tekniverse.xyz

# Proje klonla
cd /var/www
git clone git@github.com:KULLANICI_ADINIZ/REPO_ADINIZ.git tekniverse.xyz
cd tekniverse.xyz

# Environment dosyası oluştur
cp .env.example .env
nano .env
```

### 3. PM2 Ecosystem Dosyası

```bash
# PM2 ecosystem dosyası oluştur
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tekniverse-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tekniverse.xyz',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/tekniverse-error.log',
    out_file: '/var/log/pm2/tekniverse-out.log',
    log_file: '/var/log/pm2/tekniverse-combined.log',
    time: true
  }]
}
EOF
```

## 🔐 GitHub Secrets Kurulumu

GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Eklenecek secrets:

```
DATABASE_URL=postgresql://postgres:SIFRE@localhost:5432/teknikservis
NEXTAUTH_SECRET=your-secret-key-123
NEXTAUTH_URL=https://tekniverse.xyz
EMAIL_SERVER_HOST=smtp-relay.brevo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=gbatu4242@gmail.com
EMAIL_SERVER_PASSWORD=G7fnWLNCh4TSpt2c
JWT_SECRET=3d7b66034eae5c87750c564e141f9b77681e25c95cb1098db723eee55cd3ab4e
SERVER_HOST=SUNUCU_IP_ADRESI
SERVER_USER=ubuntu (veya root)
SERVER_SSH_KEY=PRIVATE_SSH_KEY_CONTENT
SERVER_PORT=22
```

## 🚀 İlk Deployment

### 1. Manuel İlk Kurulum (Sunucuda)

```bash
cd /var/www/tekniverse.xyz

# Dependencies yükle
npm ci --production

# Prisma setup
npx prisma generate
npx prisma db push

# Build
npm run build

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
```

### 2. Nginx Konfigürasyonu

```nginx
# /etc/nginx/sites-available/tekniverse.xyz
server {
    listen 80;
    server_name tekniverse.xyz www.tekniverse.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tekniverse.xyz www.tekniverse.xyz;

    ssl_certificate /etc/letsencrypt/live/tekniverse.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tekniverse.xyz/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx'i yeniden başlat
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Otomatik Deployment Testi

1. Kodu değiştir
2. Git'e push et:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. GitHub Actions'da ilerlemeyi takip et
4. https://tekniverse.xyz 'de değişiklikleri kontrol et

## 📊 Monitoring Komutları

```bash
# PM2 durumunu kontrol et
pm2 status

# Logları izle
pm2 logs tekniverse-app

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Disk kullanımı
df -h

# Memory kullanımı
free -h
```

## 🛠️ Troubleshooting

### Deployment Başarısız Olursa:

```bash
# Logları kontrol et
pm2 logs tekniverse-app

# Manuel deployment
cd /var/www/tekniverse.xyz
npm run deploy

# PM2'yi yeniden başlat
pm2 restart tekniverse-app
```

### Database Sorunları:

```bash
# Prisma reset
npx prisma db push --force-reset
npx prisma db seed
```

## 📝 Notlar

- Her push'da otomatik deployment olacak
- Build hatası varsa deployment durur
- PM2 crash durumunda otomatik restart yapar
- SSL sertifikası 3 ayda bir otomatik yenilenir

## 🎯 Sonraki Adımlar

- [ ] SSL sertifikası otomatik yenileme
- [ ] Database backup otomasyonu
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] Load balancing (gerekirse)