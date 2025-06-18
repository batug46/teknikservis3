import { NextResponse } from 'next/server';
// DİKKAT: Projenizdeki diğer admin API'larından alınan doğru yollar
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

// GET: Admin paneli için tüm sliderları listeler
export async function GET(request) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }
    try {
        const sliders = await prisma.slider.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(sliders);
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu Hatası: Sliderlar alınamadı.' }, { status: 500 });
    }
}

// POST: Yeni bir slider oluşturur
export async function POST(request) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }
    try {
        const data = await request.json();
        const { title, imageUrl, link } = data;

        if (!title || !imageUrl) {
            return NextResponse.json({ error: 'Başlık ve Resim URLsi zorunludur' }, { status: 400 });
        }

        const newSlider = await prisma.slider.create({
            data: { title, imageUrl, link: link || null }
        });
        return NextResponse.json(newSlider, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu Hatası: Slider oluşturulamadı.' }, { status: 500 });
    }
}