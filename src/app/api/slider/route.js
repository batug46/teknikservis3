import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Bu satırı ekleyin

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Failed to fetch sliders:', error);
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
  }
}