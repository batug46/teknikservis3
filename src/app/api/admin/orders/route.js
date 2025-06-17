import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          rating: true,
          product: { select: { name: true } }
        }
      }
    },
  });
  return NextResponse.json(orders);
}
