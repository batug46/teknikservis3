import { NextResponse } from 'next/server';
// Diğer admin API dosyalarınızdan teyit edilmiş doğru yollar
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request) {
    if (!verifyToken(request.cookies.get('token')?.value)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }
    try {
        const sliders = await prisma.slider.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(sliders);
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu Hatası: Sliderlar alınamadı.' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!verifyToken(request.cookies.get('token')?.value)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }
    try {
        const data = await request.json();
        const { title, imageUrl, link } = data;
        if (!title || !imageUrl) return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });

        const newSlider = await prisma.slider.create({ data: { title, imageUrl, link } });
        return NextResponse.json(newSlider, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu Hatası: Slider oluşturulamadı.' }, { status: 500 });
    }
}