import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json(); // Gelen veriyi JSON olarak ayrıştır
    const { title, imageUrl, link } = data;

    // Gerekli alanların kontrolü
    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and imageUrl are required' }, { status: 400 });
    }

    const newSlider = await prisma.slider.create({
      data: {
        title,
        imageUrl,
        link: link || null, // Link boş gelirse null olarak ayarla
      },
    });

    return NextResponse.json(newSlider, { status: 201 });
  } catch (error) {
    console.error('Failed to create slider:', error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}

export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sliders = await prisma.slider.findMany();
        return NextResponse.json(sliders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
    }
}