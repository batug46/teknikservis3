import nodemailer from 'nodemailer';

// Email transporter oluştur
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false,
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
    subject: 'Email Adresinizi Doğrulayın - Teknik Servis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Adresinizi Doğrulayın</h2>
          <p style="color: #666; margin-bottom: 20px;">Merhaba,</p>
          <p style="color: #666; margin-bottom: 30px;">Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
            Email Adresimi Doğrula
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">Bu link 24 saat geçerlidir.</p>
          <p style="color: #999; font-size: 12px;">Eğer bu emaili siz talep etmediyseniz, lütfen dikkate almayın.</p>
        </div>
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
    subject: 'Şifre Sıfırlama - Teknik Servis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Şifre Sıfırlama</h2>
          <p style="color: #666; margin-bottom: 20px;">Merhaba,</p>
          <p style="color: #666; margin-bottom: 30px;">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
            Şifremi Sıfırla
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">Bu link 24 saat geçerlidir.</p>
          <p style="color: #999; font-size: 12px;">Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen dikkate almayın.</p>
        </div>
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
    subject: 'Siparişiniz Alındı - Teknik Servis',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Siparişiniz Alındı!</h2>
          <p style="color: #666; margin-bottom: 20px;">Merhaba,</p>
          <p style="color: #666; margin-bottom: 30px;">Siparişiniz başarıyla alındı. Sipariş detayları:</p>
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p style="margin: 5px 0;"><strong>Sipariş No:</strong> #${orderDetails.id}</p>
            <p style="margin: 5px 0;"><strong>Tarih:</strong> ${new Date(orderDetails.createdAt).toLocaleString('tr-TR')}</p>
            <p style="margin: 5px 0;"><strong>Toplam Tutar:</strong> ${orderDetails.total} ₺</p>
          </div>
          <p style="color: #666; margin-top: 30px;">Siparişinizin durumunu takip etmek için profilinizi ziyaret edin.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/profile" 
               style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Siparişlerimi Görüntüle
            </a>
          </div>
        </div>
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