import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

// Tüm iletişim mesajlarını getirir
export async function GET(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}