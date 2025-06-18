import { NextResponse } from 'next/server';
// Diğer admin API dosyalarınızdan teyit edilmiş doğru yollar
import prisma from '../../../../../lib/prisma';
import { verifyToken } from '../../../../../lib/auth';

export async function DELETE(request, { params }) {
    if (!verifyToken(request.cookies.get('token')?.value)) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
    }
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: 'Geçersiz ID formatı' }, { status: 400 });

        await prisma.slider.delete({ where: { id } });
        return NextResponse.json({ message: 'Slider başarıyla silindi' });
    } catch (error) {
        return NextResponse.json({ error: 'Sunucu Hatası: Slider silinemedi.' }, { status: 500 });
    }
}