import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export async function POST(request) {
  try {
    const userPayload = await verifyAuth(request);
    if (!userPayload) {
      return NextResponse.json({ error: 'Bu işlemi yapmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userPayload.id }});
    if (!currentUser?.phone || !currentUser?.address) {
        return NextResponse.json({ error: 'Lütfen profilinizdeki telefon ve adres bilgilerinizi tamamlayın.' }, { status: 400 });
    }

    const { cartItems } = await request.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 });
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.id,
          total: totalPrice,
          phone: currentUser.phone,
          address: currentUser.address,
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
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}