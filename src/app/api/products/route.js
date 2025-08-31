import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Database connection test
    await prisma.$connect();
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const response = NextResponse.json(products);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '-1');
    return response;
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    
    // Database connection hatası kontrolü
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json({ 
        error: 'Veritabanı bağlantı hatası',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
