import { NextResponse } from 'next/server';
// Diğer admin API dosyalarınızdan teyit edilmiş doğru yollar
import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value;
        const isAdmin = await verifyToken(token);
        
        if (!isAdmin) {
            return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
        }

        const sliders = await prisma.slider.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(sliders);
    } catch (error) {
        console.error('Slider fetch error:', error);
        return NextResponse.json({ error: 'Sunucu Hatası: Sliderlar alınamadı.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value;
        const isAdmin = await verifyToken(token);
        
        if (!isAdmin) {
            return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
        }

        const data = await request.json();
        const { title, imageUrl, link } = data;

        if (!title || !imageUrl) {
            return NextResponse.json({ error: 'Başlık ve resim URL\'si zorunludur' }, { status: 400 });
        }

        const newSlider = await prisma.slider.create({
            data: {
                title,
                imageUrl,
                link: link || null
            }
        });

        return NextResponse.json(newSlider, { status: 201 });
    } catch (error) {
        console.error('Slider creation error:', error);
        return NextResponse.json({ error: 'Sunucu Hatası: Slider oluşturulamadı.' }, { status: 500 });
    }
}