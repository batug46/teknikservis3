import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { 
            name: true,
            email: true 
          } 
        },
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            rating: true,
            status: true,
            cancelReason: true,
            cancelDescription: true,
            cancelledAt: true,
            product: { 
              select: { 
                name: true,
                price: true 
              } 
            }
          }
        }
      },
    });

    const response = NextResponse.json(orders);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '-1');
    return response;
  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json({ error: 'Siparişler getirilemedi.' }, { status: 500 });
  }
}