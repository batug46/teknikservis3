import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        order: 0
      },
    });

    return NextResponse.json(newSlider, { status: 201 });
  } catch (error) {
    console.error('Failed to create slider:', error);
    return NextResponse.json({ 
      error: 'Failed to create slider',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sliders = await prisma.slider.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(sliders);
  } catch (error) {
    console.error('Failed to fetch sliders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sliders',
      details: error.message 
    }, { status: 500 });
  }
}