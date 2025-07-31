import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { sanitizeInput, validateEmail } from '../../../../lib/security';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-that-is-long-enough'
);

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Input validation ve sanitization
    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre zorunludur.' }, { status: 400 });
    }

    // Email validation
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Geçersiz email formatı.' }, { status: 400 });
    }

    // Input sanitization
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
    }

    const token = await new SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(JWT_SECRET);

    const { password: _, ...userWithoutPassword } = user;
    
    const response = NextResponse.json({
      message: 'Giriş başarılı!',
      user: userWithoutPassword,
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Giriş API Hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
