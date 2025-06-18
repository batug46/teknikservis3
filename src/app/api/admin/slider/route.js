import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request) {
  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }
  try {
    const data = await request.json(); // Bu satır artık hata vermeyecek
    const newSlider = await prisma.slider.create({ data });
    return NextResponse.json(newSlider, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Slider oluşturulurken sunucu hatası oluştu' }, { status: 500 });
  }
}

export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    try {
        const sliders = await prisma.slider.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(sliders);
    } catch (error) {
        return NextResponse.json({ error: 'Sliderlar alınırken sunucu hatası oluştu' }, { status: 500 });
    }
}