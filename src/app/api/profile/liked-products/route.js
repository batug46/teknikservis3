import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    let userId = session.user?.id;
    
    // Eğer userId yoksa email ile kullanıcıyı bul
    if (!userId && session.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
        console.log('Found user by email:', user);
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID bulunamadı' }, { status: 400 });
    }

    // Kullanıcının beğendiği ürünleri getir
    const likedProducts = await prisma.likedProduct.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Sadece aktif ürünleri döndür
    const activeLikedProducts = likedProducts
      .filter(lp => lp.product.isActive)
      .map(lp => lp.product);

    return NextResponse.json(activeLikedProducts);
  } catch (error) {
    console.error('Beğenilen ürünler getirme hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 