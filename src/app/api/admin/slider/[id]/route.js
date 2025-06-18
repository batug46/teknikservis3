import { NextResponse } from 'next/server';
// DİKKAT: Projenizdeki diğer admin API'larından alınan doğru yollar
import prisma from '../../../../../lib/prisma';
import { verifyToken } from '../../../../../lib/auth';

// DELETE: Belirli bir slider'ı ID'ye göre siler
export async function DELETE(request, { params }) {
    const token = request.cookies.get('token')?.value;
    if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }

    try {
        const { id } = params;
        await prisma.slider.delete({
            where: { id: parseInt(id, 10) }
        });
        return NextResponse.json({ message: 'Slider başarıyla silindi' }, { status: 200 });
    } catch (error) {
        // Eğer silinecek ID bulunamazsa Prisma hata verir, bunu yakalıyoruz.
        if (error.code === 'P2025') {
             return NextResponse.json({ error: 'Silinecek slider bulunamadı.' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Sunucu Hatası: Slider silinemedi.' }, { status: 500 });
    }
}