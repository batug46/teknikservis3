import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// Tüm kullanıcıları listeler (mesaj göndermek için)
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  
  const users = await prisma.user.findMany({
    where: { NOT: { id: user.id } }, // Kullanıcı kendine mesaj göndermesin
    select: { id: true, name: true }
  });
  return NextResponse.json(users);
}