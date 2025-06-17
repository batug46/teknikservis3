import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

// Giden kutusunu getirir
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const messages = await prisma.privateMessage.findMany({
    where: { senderId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { recipient: { select: { name: true } } }
  });
  return NextResponse.json(messages);
}