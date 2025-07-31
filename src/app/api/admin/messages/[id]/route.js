import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const messageId = parseInt(params.id);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Geçersiz mesaj ID' }, { status: 400 });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    return NextResponse.json({ error: 'Mesaj silinirken bir hata oluştu' }, { status: 500 });
  }
} 