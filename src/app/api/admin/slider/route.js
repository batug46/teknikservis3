import { NextResponse } from 'next/server';
// Projenizdeki diğer çalışan dosyalardan alınan doğru yollar:
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function POST(request) {
  const token = request.cookies.get('token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, imageUrl, link } = data;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Başlık ve Resim URLsi zorunludur' }, { status: 400 });
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
    console.error('Slider oluşturma hatası:', error);
    // İstemciye daha anlamlı bir hata mesajı gönder
    return NextResponse.json({ error: 'Sunucu hatası: Slider oluşturulamadı.' }, { status: 500 });
  }
}

export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sliders = await prisma.slider.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(sliders);
    } catch (error) {
        console.error('Slider listeleme hatası:', error);
        return NextResponse.json({ error: 'Sunucu hatası: Sliderlar alınamadı.' }, { status: 500 });
    }
}