import nodemailer from 'nodemailer';

// Email transporter oluştur
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Email doğrulama kodu gönder
export async function sendVerificationEmail(email, verificationToken) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: email,
    subject: 'Email Adresinizi Doğrulayın',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Doğrulama</h2>
        <p>Merhaba,</p>
        <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Email Adresimi Doğrula
        </a>
        <p>Bu link 24 saat geçerlidir.</p>
        <p>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Şifre sıfırlama emaili gönder
export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: email,
    subject: 'Şifre Sıfırlama',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Şifre Sıfırlama</h2>
        <p>Merhaba,</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Şifremi Sıfırla
        </a>
        <p>Bu link 1 saat geçerlidir.</p>
        <p>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

// Sipariş onay emaili gönder
export async function sendOrderConfirmationEmail(email, orderDetails) {
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
    to: email,
    subject: `Sipariş Onayı - #${orderDetails.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Siparişiniz Alındı!</h2>
        <p>Merhaba,</p>
        <p>Siparişiniz başarıyla alındı. Sipariş detayları:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Sipariş No:</strong> #${orderDetails.id}</p>
          <p><strong>Tarih:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('tr-TR')}</p>
          <p><strong>Toplam Tutar:</strong> ${orderDetails.total} ₺</p>
        </div>
        <p>Siparişinizin durumunu takip etmek için profilinizi ziyaret edin.</p>
        <p>Teşekkürler!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return { success: false, error: error.message };
  }
} 