import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// API route'u dinamik olarak işaretle
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Sipariş detaylarını düzenle
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      total: order.total,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        rating: item.rating,
        status: item.status,
        cancelReason: item.cancelReason,
        cancelDescription: item.cancelDescription,
        cancelledAt: item.cancelledAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price
        }
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Siparişler alınırken hata:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}