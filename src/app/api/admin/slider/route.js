import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const slides = await prisma.slider.findMany({
      where: {
        imageUrl: {
          not: null
        }
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        order: true
      }
    });
    return NextResponse.json(slides || []);
  } catch (error) {
    console.error('Slider API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.imageUrl) {
      return NextResponse.json({ error: 'Başlık ve görsel URL zorunludur.' }, { status: 400 });
    }

    const slide = await prisma.slider.create({
      data: {
        ...data,
        order: parseInt(data.order) || 0
      }
    });
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('Slider API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
