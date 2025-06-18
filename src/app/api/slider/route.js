import { NextResponse } from 'next/server';
// Projenizdeki diğer çalışan dosyalardan alınan doğru yol:
import prisma from '../../../lib/prisma';

// Vercel'in eski veriyi önbellekten getirmesini engeller.
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Sliderlar alınamadı:', error);
    return NextResponse.json({ error: 'Sliderlar alınamadı' }, { status: 500 });
  }
}