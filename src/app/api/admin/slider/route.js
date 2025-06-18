import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export async function GET(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const slides = await prisma.slider.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(slides);
  } catch (error) {
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
    const slide = await prisma.slider.create({ data });
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
