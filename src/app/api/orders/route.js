import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { sendOrderConfirmationEmail } from '../../../lib/email';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Bu işlemi yapmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }});
    if (!currentUser?.phone || !currentUser?.address) {
        return NextResponse.json({ error: 'Lütfen profilinizdeki telefon ve adres bilgilerinizi tamamlayın.' }, { status: 400 });
    }

    const { cartItems } = await request.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 });
    }

    // Stok kontrolü yap
    const productIds = cartItems.map(item => item.id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    // Stok yetersizliği kontrolü
    const stockErrors = [];
    products.forEach(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      if (cartItem && cartItem.quantity > product.stock) {
        stockErrors.push(`${product.name} için yeterli stok yok. Mevcut stok: ${product.stock}`);
      }
    });

    if (stockErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Stok yetersiz', 
        details: stockErrors 
      }, { status: 400 });
    }

    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Siparişi oluştur
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: totalPrice,
          phone: currentUser.phone,
          address: currentUser.address,
          status: 'PENDING',
        },
      });

      // Sipariş öğelerini oluştur ve stokları güncelle
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Stok güncelleme
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    // Email gönderimi (opsiyonel - hata durumunda sipariş yine de oluşturulur)
    try {
      if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
        await sendOrderConfirmationEmail(currentUser.email, {
          id: order.id,
          total: totalPrice,
          createdAt: order.createdAt
        });
      }
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
      // Email hatası siparişi etkilemez
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}