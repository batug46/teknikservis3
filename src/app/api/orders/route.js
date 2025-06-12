import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export async function POST(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Bu işlemi yapmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const body = await request.json(); // .json() ile okuyoruz
    
    // Gelen veride 'cartItems' olup olmadığını kontrol ediyoruz
    if (!body || !Array.isArray(body.cartItems) || body.cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet bilgileri eksik veya boş.' }, { status: 400 });
    }

    const { cartItems } = body;
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.id,
          total: totalPrice,
          status: 'pending',
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası. Sipariş oluşturulamadı.' }, { status: 500 });
  }
}
