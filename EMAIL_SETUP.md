# 📧 Email Sistemi Kurulum Rehberi

## 📋 Email Sistemi Özellikleri

### ✅ **Mevcut Email Özellikleri:**
- ✅ Email doğrulama (kayıt sonrası)
- ✅ Şifre sıfırlama emaili
- ✅ Sipariş onay emaili
- ✅ Güvenli SMTP bağlantısı
- ✅ HTML email template'leri

## 🚀 Email Servisi Kurulumu

### 1. **Gmail SMTP Kurulumu (Önerilen)**

#### Gmail App Password Oluşturma:
1. **Google Hesabınıza giriş yapın**
2. **Güvenlik > 2 Adımlı Doğrulama** aktif edin
3. **Uygulama Şifreleri** bölümüne gidin
4. **"Diğer"** seçin ve "Teknik Servis" yazın
5. **Oluşturulan 16 haneli şifreyi** kopyalayın

#### Environment Variables:
```env
# Gmail SMTP Ayarları
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-digit-app-password"
```

### 2. **SendGrid Kurulumu (Production için)**

#### SendGrid Hesap Oluşturma:
1. **SendGrid.com**'a gidin
2. **Ücretsiz hesap** oluşturun
3. **API Key** oluşturun
4. **Domain authentication** yapın

#### Environment Variables:
```env
# SendGrid SMTP Ayarları
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
```

### 3. **Outlook/Hotmail Kurulumu**

#### Environment Variables:
```env
# Outlook SMTP Ayarları
EMAIL_SERVER_HOST="smtp-mail.outlook.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@outlook.com"
EMAIL_SERVER_PASSWORD="your-password"
```

## 🔧 Email Test Etme

### 1. **Test Email Gönderme**

```bash
# Test script'i oluştur
nano test-email.js
```

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

async function testEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: "test@example.com",
      subject: "Test Email - Teknik Servis",
      html: `
        <h2>Test Email</h2>
        <p>Bu bir test emailidir.</p>
        <p>Gönderim zamanı: ${new Date().toLocaleString('tr-TR')}</p>
      `
    });
    
    console.log('Email gönderildi:', info.messageId);
  } catch (error) {
    console.error('Email gönderme hatası:', error);
  }
}

testEmail();
```

### 2. **Test Çalıştırma**

```bash
# Environment variables yükle
source .env

# Test script'ini çalıştır
node test-email.js
```

## 📧 Email Template'leri

### 1. **Email Doğrulama Template'i**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Email Adresinizi Doğrulayın</h2>
  <p>Merhaba,</p>
  <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
  <a href="{{verificationUrl}}" 
     style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
    Email Adresimi Doğrula
  </a>
  <p>Bu link 24 saat geçerlidir.</p>
</div>
```

### 2. **Sipariş Onay Template'i**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Siparişiniz Alındı!</h2>
  <p>Merhaba {{customerName}},</p>
  <p>Siparişiniz başarıyla alındı. Sipariş detayları:</p>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Sipariş No:</strong> #{{orderId}}</p>
    <p><strong>Tarih:</strong> {{orderDate}}</p>
    <p><strong>Toplam Tutar:</strong> {{totalAmount}} ₺</p>
  </div>
  <p>Siparişinizin durumunu takip etmek için profilinizi ziyaret edin.</p>
</div>
```

## 🔒 Email Güvenlik

### 1. **SMTP Güvenlik Ayarları**

```javascript
// Güvenli SMTP konfigürasyonu
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

### 2. **Rate Limiting**

```javascript
// Email rate limiting
const emailRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // 10 email
  message: 'Çok fazla email gönderildi. Lütfen daha sonra tekrar deneyin.'
};
```

## 🚨 Email Troubleshooting

### 1. **Yaygın Email Sorunları**

#### Authentication Failed:
```bash
# Gmail için App Password kullandığınızdan emin olun
# Normal şifre çalışmaz, App Password gerekli
```

#### Connection Timeout:
```bash
# Port ayarlarını kontrol edin
# 587 (TLS) veya 465 (SSL) kullanın
```

#### Email Gönderilmiyor:
```bash
# Environment variables'ları kontrol edin
# SMTP ayarlarını test edin
# Firewall ayarlarını kontrol edin
```

### 2. **Email Test Komutları**

```bash
# SMTP bağlantısını test et
telnet smtp.gmail.com 587

# Email gönderim testi
curl -X POST http://localhost:3000/api/test-email
```

## 📊 Email Monitoring

### 1. **Email Logları**

```javascript
// Email gönderim logları
transporter.on('sent', (info) => {
  console.log('Email gönderildi:', info.messageId);
});

transporter.on('error', (error) => {
  console.error('Email hatası:', error);
});
```

### 2. **Email İstatistikleri**

```javascript
// Email başarı oranı
const emailStats = {
  sent: 0,
  failed: 0,
  successRate: 0
};
```

## 🎯 Email Best Practices

### 1. **Güvenlik Önerileri**
- ✅ App Password kullan (Gmail için)
- ✅ Environment variables kullan
- ✅ Rate limiting uygula
- ✅ Email template'lerini güvenli tut

### 2. **Performance Optimizasyonu**
- ✅ SMTP connection pooling
- ✅ Email queue sistemi
- ✅ Batch email gönderimi
- ✅ Email template caching

### 3. **User Experience**
- ✅ Responsive email template'leri
- ✅ Açık ve net mesajlar
- ✅ Call-to-action butonları
- ✅ Unsubscribe link'leri

## 📞 Email Destek

### 1. **Email Servisleri**
- **Gmail:** Ücretsiz, 500 email/gün
- **SendGrid:** Ücretsiz, 100 email/gün
- **Mailgun:** Ücretsiz, 5,000 email/ay
- **Amazon SES:** Çok uygun fiyatlı

### 2. **Email Template Araçları**
- **MJML:** Responsive email template'leri
- **EmailJS:** JavaScript email template'leri
- **React Email:** React tabanlı email template'leri

---

**Son Güncelleme:** $(date)
**Email Sistemi:** ✅ Hazır
**Güvenlik Seviyesi:** 🔒 Yüksek 