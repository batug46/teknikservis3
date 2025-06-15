import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  const slides = await prisma.slider.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(slides);
}

export async function POST(request) {
  const data = await request.json();
  const slide = await prisma.slider.create({ data });
  return NextResponse.json(slide, { status: 201 });
}
