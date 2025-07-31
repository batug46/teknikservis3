import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

export async function PUT(request, { params }) {
  try {
    console.log('PUT request received for order:', params.id);
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { status } = body;
    const orderId = parseInt(params.id);
    
    console.log('Updating order:', { orderId, status });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
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
      }
    });

    console.log('Order updated successfully:', updatedOrder);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return NextResponse.json({ 
      error: 'Sipariş güncellenirken bir hata oluştu.',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const orderId = parseInt(params.id);

    // Önce sipariş öğelerini sil
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    });

    // Sonra siparişi sil
    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ message: 'Sipariş başarıyla silindi.' });
  } catch (error) {
    console.error('Sipariş silme hatası:', error);
    return NextResponse.json({ error: 'Sipariş silinirken bir hata oluştu.' }, { status: 500 });
  }
} 