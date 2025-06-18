import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Bu satır, Vercel'in eski veriyi önbellekten getirmesini engeller.
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!sliders || sliders.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Failed to fetch sliders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sliders',
      details: error.message 
    }, { status: 500 });
  }
}