import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const slides = await prisma.slider.findMany({
      where: {
        imageUrl: {
          not: null,
        },
      },
      orderBy: { order: 'asc' },
    });

    if (!slides) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(slides);
  } catch (error) {
    console.error("Slider API Error:", error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
} 