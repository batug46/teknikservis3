import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// Belirtilen ID'ye sahip slide'ı günceller
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    const slide = await prisma.slider.update({ where: { id }, data });
    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
  }
}

// Belirtilen ID'ye sahip slide'ı siler
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.slider.delete({ where: { id } });
    return NextResponse.json({ message: 'Slide başarıyla silindi' });
  } catch (error) {
    return NextResponse.json({ error: 'Silme işlemi başarısız' }, { status: 500 });
  }
}