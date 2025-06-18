import { NextResponse } from 'next/server';
// Diğer genel API dosyalarınızdan teyit edilmiş doğru yol
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu Hatası: Sliderlar alınamadı.' }, { status: 500 });
  }
}