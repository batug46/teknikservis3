import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'desc' },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}