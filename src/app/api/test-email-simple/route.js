import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
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

    console.log('Email ayarları:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      // password'u log'lama
    });

    const mailOptions = {
      from: process.env.EMAIL_SERVER_USER,
      to: 'gbatu4242@gmail.com', // Test için kendi emailinize
      subject: 'Test Email - Tekniverse.xyz',
      text: 'Bu bir test emailidir. Email sistemi çalışıyor!',
      html: `
        <h2>Test Email</h2>
        <p>Bu bir test emailidir.</p>
        <p>Email sistemi başarıyla çalışıyor!</p>
        <p>Tarih: ${new Date().toLocaleString('tr-TR')}</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email başarıyla gönderildi!',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error
    }, { status: 500 });
  }
}