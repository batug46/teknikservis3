import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { cartItems } = await request.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 });
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Prisma'nın transaction özelliğini kullanarak tüm işlemleri tek seferde ve güvenli yapalım.
    const order = await prisma.$transaction(async (tx) => {
      // 1. Ana Sipariş kaydını oluştur
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.id,
          total: totalPrice,
          status: 'pending', // Sipariş durumu: beklemede
        },
      });

      // 2. Sepetteki her bir ürün için Sipariş Kalemi (OrderItem) oluştur
      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: newOrder.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price, // Satın alma anındaki fiyatı kaydet
        })),
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sipariş oluşturulurken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}
