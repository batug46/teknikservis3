import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    // Request body'yi parse et
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Request body parse error:', error);
      return NextResponse.json({ error: 'Geçersiz istek formatı' }, { status: 400 });
    }

    const { email, password, name, adSoyad, phone } = body;

    // Input validation
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email adresi zorunludur' }, { status: 400 });
    }
    if (!password?.trim() || password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: 'İsim zorunludur' }, { status: 400 });
    }
    if (!adSoyad?.trim()) {
      return NextResponse.json({ error: 'Ad Soyad zorunludur' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir email adresi giriniz' }, { status: 400 });
    }

    // Check database connection
    try {
      await prisma.$connect();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json({ error: 'Veritabanı bağlantı hatası' }, { status: 500 });
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('User check error:', error);
      return NextResponse.json({ error: 'Kullanıcı kontrolü sırasında hata oluştu' }, { status: 500 });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.error('Password hashing error:', error);
      return NextResponse.json({ error: 'Şifre şifreleme hatası' }, { status: 500 });
    }

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          adSoyad: adSoyad.trim(),
          phone: phone?.trim(),
          role: 'user',
        },
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        message: 'Kayıt başarılı',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('User creation error:', error);
      
      // Check for specific Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanımda' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Kullanıcı oluşturma sırasında hata oluştu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  } finally {
    // Disconnect from database
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Database disconnect error:', error);
    }
  }
} 