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
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID bulunamadı' }, { status: 400 });
    }

    // Kullanıcının iade taleplerini getir
    const returns = await prisma.return.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        orderItem: {
          include: {
            product: true,
            order: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(returns);
  } catch (error) {
    console.error('İade talepleri getirme hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 