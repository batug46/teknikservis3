import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request) {
  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Önceki kodda bu satır eksikti, bu yüzden veriler alınamıyordu.
    const data = await request.json(); 
    const { title, imageUrl, link } = data;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and imageUrl are required' }, { status: 400 });
    }

    const newSlider = await prisma.slider.create({
      data: {
        title,
        imageUrl,
        link: link || null,
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