import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { status } = await request.json();
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}