import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

// Gelen kutusunu getirir
export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const messages = await prisma.privateMessage.findMany({
    where: { recipientId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { sender: { select: { name: true } } }
  });
  return NextResponse.json(messages);
}

// Yeni mesaj gönderir
export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  
  const { recipientId, subject, body } = await request.json();

  const newMessage = await prisma.privateMessage.create({
    data: {
      senderId: user.id,
      recipientId: parseInt(recipientId),
      subject,
      body,
    }
  });
  return NextResponse.json(newMessage, { status: 201 });
}