import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email adresi gerekli' 
      }, { status: 400 });
    }

    console.log('🔧 Email ayarları kontrol ediliyor...');
    console.log('📧 Host:', process.env.EMAIL_SERVER_HOST);
    console.log('🔌 Port:', process.env.EMAIL_SERVER_PORT);
    console.log('👤 User:', process.env.EMAIL_SERVER_USER);
    console.log('🔑 Password length:', process.env.EMAIL_SERVER_PASSWORD?.length);

    // Test için basit email gönderimi
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT),
      secure: false, // 587 port için false
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    console.log('📨 Email gönderimi başlatılıyor...');

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: to,
      subject: 'Test Email - Tekniverse.xyz',
      text: 'Bu bir test emailidir. Email sistemi çalışıyor!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🚀 Test Email - Tekniverse.xyz</h2>
          <p>Bu bir test emailidir.</p>
          <p><strong>Email sistemi başarıyla çalışıyor!</strong></p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Test Detayları:</strong></p>
            <ul>
              <li>Tarih: ${new Date().toLocaleString('tr-TR')}</li>
              <li>SMTP Provider: Brevo</li>
              <li>From: ${process.env.EMAIL_SERVER_USER}</li>
              <li>To: ${to}</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">Bu email Tekniverse.xyz email sistemi test amaçlı gönderilmiştir.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email başarıyla gönderildi! Message ID:', result.messageId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email başarıyla gönderildi!',
      messageId: result.messageId,
      to: to,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      command: error.command
    }, { status: 500 });
  }
}