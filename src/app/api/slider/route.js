import { NextResponse } from 'next/server';
// DİKKAT: Projenizdeki diğer genel API'lardan alınan doğru yol
import prisma from '../../../lib/prisma';

// Bu satır, Vercel'in bu API'dan gelen yanıtı önbelleğe almasını engeller
// ve her zaman veritabanından güncel veriyi çeker.
export const dynamic = 'force-dynamic';

// GET: Herkesin erişebileceği, ana sayfada gösterilecek sliderları listeler
export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu Hatası: Sliderlar alınamadı.' }, { status: 500 });
  }
}