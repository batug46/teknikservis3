import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { id } = params;
    let userId = session.user?.id;
    
    console.log('Session:', session);
    console.log('User ID:', userId);
    console.log('Product ID:', id);

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

    // Ürünün var olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Kullanıcının bu ürünü daha önce beğenip beğenmediğini kontrol et
    const existingLike = await prisma.likedProduct.findUnique({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(id)
        }
      }
    });

    if (existingLike) {
      // Beğeniyi kaldır
      await prisma.likedProduct.delete({
        where: {
          userId_productId: {
            userId: parseInt(userId),
            productId: parseInt(id)
          }
        }
      });
      return NextResponse.json({ liked: false, message: 'Beğeni kaldırıldı' });
    } else {
      // Beğeniyi ekle
      await prisma.likedProduct.create({
        data: {
          userId: parseInt(userId),
          productId: parseInt(id)
        }
      });
      return NextResponse.json({ liked: true, message: 'Ürün beğenildi' });
    }
  } catch (error) {
    console.error('Beğenme hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const { id } = params;
    let userId = session.user?.id;
    
    console.log('GET - Session:', session);
    console.log('GET - User ID:', userId);
    console.log('GET - Product ID:', id);

    // Eğer userId yoksa email ile kullanıcıyı bul
    if (!userId && session.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        userId = user.id;
        console.log('GET - Found user by email:', user);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID bulunamadı' }, { status: 400 });
    }

    // Kullanıcının bu ürünü beğenip beğenmediğini kontrol et
    const existingLike = await prisma.likedProduct.findUnique({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(id)
        }
      }
    });

    return NextResponse.json({ liked: !!existingLike });
  } catch (error) {
    console.error('Beğenme durumu kontrol hatası:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
} 