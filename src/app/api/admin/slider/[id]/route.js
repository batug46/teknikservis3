import { NextResponse } from 'next/server';
// Diğer admin API dosyalarınızdan teyit edilmiş doğru yollar
import prisma from '../../../../../lib/prisma';
import { verifyToken } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
    try {
        const token = request.cookies.get('token')?.value;
        const isAdmin = await verifyToken(token);
        
        if (!isAdmin) {
            return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 401 });
        }

        const { id } = params;
        
        const slider = await prisma.slider.delete({
            where: { id }
        });

        return NextResponse.json(slider);
    } catch (error) {
        console.error('Slider deletion error:', error);
        return NextResponse.json({ error: 'Sunucu Hatası: Slider silinemedi.' }, { status: 500 });
    }
}