import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '../../../lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email adresi gerekli' }, { status: 400 });
    }

    // Test email gönderimi
    const result = await sendOrderConfirmationEmail(email, {
      id: 999,
      total: 150.00,
      createdAt: new Date()
    });

    if (result.success) {
      return NextResponse.json({ 
        message: 'Test email başarıyla gönderildi',
        email: email 
      });
    } else {
      return NextResponse.json({ 
        error: 'Email gönderilemedi',
        details: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email test hatası:', error);
    return NextResponse.json({ 
      error: 'Email test hatası',
      details: error.message 
    }, { status: 500 });
  }
} 