# 🔐 SSH Kurulum ve Yapılandırma Rehberi

## 📋 SSH Nedir?

SSH (Secure Shell), güvenli uzaktan erişim protokolüdür. Sunucunuza güvenli bir şekilde bağlanmanızı sağlar.

## 🚀 SSH Kurulum Adımları

### 1. **SSH Key Oluşturma**

#### Windows'ta SSH Key Oluşturma:
```bash
# SSH key oluştur
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Varsayılan konum: C:\Users\YourUsername\.ssh\id_rsa
# Passphrase isteğe bağlı (güvenlik için önerilen)
```

#### Linux/Mac'te SSH Key Oluşturma:
```bash
# SSH key oluştur
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Varsayılan konum: ~/.ssh/id_rsa
```

### 2. **SSH Agent Başlatma**

#### Windows'ta:
```bash
# SSH agent başlat
Start-Service ssh-agent

# SSH key'i agent'a ekle
ssh-add C:\Users\YourUsername\.ssh\id_rsa
```

#### Linux/Mac'te:
```bash
# SSH agent başlat
eval "$(ssh-agent -s)"

# SSH key'i agent'a ekle
ssh-add ~/.ssh/id_rsa
```

### 3. **Public Key'i Kopyalama**

#### Windows'ta:
```bash
# Public key'i görüntüle
Get-Content C:\Users\YourUsername\.ssh\id_rsa.pub

# Veya kopyala
Get-Content C:\Users\YourUsername\.ssh\id_rsa.pub | Set-Clipboard
```

#### Linux/Mac'te:
```bash
# Public key'i görüntüle
cat ~/.ssh/id_rsa.pub

# Veya kopyala
cat ~/.ssh/id_rsa.pub | pbcopy
```

### 4. **GitHub'a SSH Key Ekleme**

1. **GitHub'a giriş yap**
2. **Settings > SSH and GPG keys**
3. **New SSH key** butonuna tıkla
4. **Title:** "Teknik Servis Projesi"
5. **Key:** Kopyaladığın public key'i yapıştır
6. **Add SSH key** butonuna tıkla

### 5. **SSH Bağlantısını Test Etme**

```bash
# GitHub SSH bağlantısını test et
ssh -T git@github.com

# Başarılı mesajı:
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

### 6. **Repository'yi SSH ile Clone Etme**

```bash
# HTTPS yerine SSH kullan
git clone git@github.com:batu42g/teknik-servis-v2.git

# Mevcut repository'yi SSH'ye çevir
git remote set-url origin git@github.com:batu42g/teknik-servis-v2.git
```

## 🔧 SSH Yapılandırması

### 1. **SSH Config Dosyası Oluşturma**

#### Windows'ta:
```bash
# SSH config dosyası oluştur
New-Item -Path "C:\Users\YourUsername\.ssh\config" -ItemType File
```

#### Linux/Mac'te:
```bash
# SSH config dosyası oluştur
touch ~/.ssh/config
```

### 2. **SSH Config İçeriği**

```bash
# ~/.ssh/config dosyasına ekle:

# GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes

# Sunucu (production)
Host teknik-servis-server
    HostName your-server-ip.com
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
```

### 3. **SSH Güvenlik Ayarları**

#### Sunucuda SSH Yapılandırması:
```bash
# SSH config dosyasını düzenle
sudo nano /etc/ssh/sshd_config

# Güvenlik ayarları:
Port 22
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
HostKey /etc/ssh/ssh_host_ed25519_key
UsePrivilegeSeparation yes
KeyRegenerationInterval 3600
ServerKeyBits 1024
SyslogFacility AUTH
LogLevel INFO
LoginGraceTime 120
PermitRootLogin no
StrictModes yes
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile %h/.ssh/authorized_keys
IgnoreRhosts yes
RhostsRSAAuthentication no
HostbasedAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
PasswordAuthentication no
X11Forwarding yes
X11DisplayOffset 10
PrintMotd no
PrintLastLog yes
TCPKeepAlive yes
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
UsePAM yes
```

### 4. **SSH Service Restart**

```bash
# SSH service'i yeniden başlat
sudo systemctl restart ssh

# SSH service durumunu kontrol et
sudo systemctl status ssh
```

## 🔒 SSH Güvenlik Önlemleri

### 1. **Fail2ban Kurulumu**

```bash
# Fail2ban kurulumu
sudo apt install fail2ban

# Fail2ban config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# SSH jail ayarları
sudo nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

### 2. **SSH Key Rotation**

```bash
# Yeni SSH key oluştur
ssh-keygen -t rsa -b 4096 -C "new-key@example.com"

# Eski key'i yedekle
cp ~/.ssh/id_rsa ~/.ssh/id_rsa.backup

# Yeni key'i kullan
mv ~/.ssh/id_rsa_new ~/.ssh/id_rsa
```

### 3. **SSH Monitoring**

```bash
# SSH loglarını izle
sudo tail -f /var/log/auth.log

# Başarısız giriş denemelerini kontrol et
sudo grep "Failed password" /var/log/auth.log

# SSH bağlantılarını izle
sudo netstat -tulpn | grep :22
```

## 🚨 SSH Troubleshooting

### 1. **Yaygın SSH Sorunları**

#### Permission Denied:
```bash
# SSH key permissions'ları düzelt
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

#### Connection Refused:
```bash
# SSH service durumunu kontrol et
sudo systemctl status ssh

# Firewall ayarlarını kontrol et
sudo ufw status
```

#### Host Key Verification Failed:
```bash
# Known hosts dosyasını temizle
ssh-keygen -R github.com

# Veya tüm known hosts'u temizle
rm ~/.ssh/known_hosts
```

### 2. **SSH Debug Mode**

```bash
# Verbose SSH bağlantısı
ssh -v git@github.com

# Daha detaylı debug
ssh -vv git@github.com

# En detaylı debug
ssh -vvv git@github.com
```

## 📊 SSH Monitoring Scripts

### 1. **SSH Connection Monitor**

```bash
#!/bin/bash
# ssh_monitor.sh

echo "SSH Bağlantı Durumu:"
echo "====================="

# Aktif SSH bağlantıları
echo "Aktif SSH Bağlantıları:"
ss -tulpn | grep :22

# SSH logları
echo -e "\nSon SSH Logları:"
tail -n 10 /var/log/auth.log | grep sshd

# Başarısız giriş denemeleri
echo -e "\nBaşarısız Giriş Denemeleri:"
grep "Failed password" /var/log/auth.log | tail -n 5
```

### 2. **SSH Security Check**

```bash
#!/bin/bash
# ssh_security_check.sh

echo "SSH Güvenlik Kontrolü:"
echo "======================"

# SSH config kontrolü
echo "SSH Config Durumu:"
grep -E "PermitRootLogin|PasswordAuthentication|PubkeyAuthentication" /etc/ssh/sshd_config

# SSH key kontrolü
echo -e "\nSSH Keys:"
ls -la ~/.ssh/

# Fail2ban durumu
echo -e "\nFail2ban Durumu:"
sudo fail2ban-client status sshd
```

## 🎯 SSH Best Practices

### 1. **Güvenlik Önerileri**
- ✅ SSH key kullan (password yerine)
- ✅ Root login'i devre dışı bırak
- ✅ SSH port'unu değiştir (22 yerine)
- ✅ Fail2ban kullan
- ✅ Regular key rotation
- ✅ Monitoring ve logging

### 2. **Performance Optimizasyonu**
- ✅ SSH multiplexing kullan
- ✅ Compression aktif et
- ✅ Keep-alive ayarları
- ✅ Connection pooling

### 3. **Backup ve Recovery**
- ✅ SSH keys yedekle
- ✅ Config dosyaları yedekle
- ✅ Recovery plan hazırla
- ✅ Test procedures

## 📞 SSH Destek

### 1. **SSH Komutları Referansı**
```bash
# SSH bağlantısı
ssh user@hostname

# SSH key ile bağlantı
ssh -i ~/.ssh/id_rsa user@hostname

# Port belirterek bağlantı
ssh -p 2222 user@hostname

# X11 forwarding
ssh -X user@hostname

# Port forwarding
ssh -L 8080:localhost:80 user@hostname
```

### 2. **SSH Config Örnekleri**
```bash
# Çoklu sunucu yapılandırması
Host production
    HostName prod.example.com
    User deploy
    Port 22
    IdentityFile ~/.ssh/prod_key

Host staging
    HostName staging.example.com
    User deploy
    Port 2222
    IdentityFile ~/.ssh/staging_key
```

---

**Son Güncelleme:** $(date)
**SSH Versiyonu:** OpenSSH 8.2p1
**Güvenlik Seviyesi:** 🔒 Yüksek 