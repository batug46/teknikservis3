import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

// Yorumları getir
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, rating

    const skip = (page - 1) * limit;

    // Yorumları getir
    const reviews = await prisma.productReview.findMany({
      where: {
        productId: parseInt(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            adSoyad: true,
          },
        },
      },
      orderBy: {
        ...(sort === 'newest' && { createdAt: 'desc' }),
        ...(sort === 'oldest' && { createdAt: 'asc' }),
        ...(sort === 'rating' && { rating: 'desc' }),
      },
      skip,
      take: limit,
    });

    // Toplam yorum sayısını getir
    const totalReviews = await prisma.productReview.count({
      where: {
        productId: parseInt(id),
      },
    });

    // Ortalama puanı hesapla
    const avgRating = await prisma.productReview.aggregate({
      where: {
        productId: parseInt(id),
      },
      _avg: {
        rating: true,
      },
    });

    // Puan dağılımını hesapla
    const ratingDistribution = await prisma.productReview.groupBy({
      by: ['rating'],
      where: {
        productId: parseInt(id),
      },
      _count: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
      summary: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Yorumlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Yorumlar getirilemedi' },
      { status: 500 }
    );
  }
}

// Yeni yorum ekle
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Yorum yapmak için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { rating, title, comment, images } = await request.json();

    // Validasyon
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Geçerli bir puan giriniz (1-5)' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Yorum en az 10 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Ürünün var olduğunu kontrol et
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının bu ürün için daha önce yorum yapıp yapmadığını kontrol et
    const existingReview = await prisma.productReview.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: parseInt(id),
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Bu ürün için zaten yorum yapmışsınız' },
        { status: 400 }
      );
    }

    // Kullanıcının bu ürünü satın alıp almadığını kontrol et (doğrulanmış yorum için)
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: parseInt(id),
        order: {
          userId: session.user.id,
          status: 'completed',
        },
      },
    });

    // Yorumu oluştur
    const review = await prisma.productReview.create({
      data: {
        productId: parseInt(id),
        userId: session.user.id,
        rating,
        title: title?.trim() || null,
        comment: comment.trim(),
        images: images || [],
        isVerified: !!hasPurchased,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            adSoyad: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Yorum başarıyla eklendi',
      review,
    });
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Yorum eklenemedi' },
      { status: 500 }
    );
  }
}

// Yorum güncelle
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Yorum düzenlemek için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { reviewId, rating, title, comment, images } = await request.json();

    // Validasyon
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Yorum ID gerekli' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Geçerli bir puan giriniz (1-5)' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Yorum en az 10 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Yorumun kullanıcıya ait olduğunu kontrol et
    const existingReview = await prisma.productReview.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: session.user.id,
        productId: parseInt(id),
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Bu yorumu düzenleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Yorumu güncelle
    const updatedReview = await prisma.productReview.update({
      where: {
        id: parseInt(reviewId),
      },
      data: {
        rating,
        title: title?.trim() || null,
        comment: comment.trim(),
        images: images || [],
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            adSoyad: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Yorum başarıyla güncellendi',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yorum sil
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Yorum silmek için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Yorum ID gerekli' },
        { status: 400 }
      );
    }

    // Yorumun kullanıcıya ait olduğunu kontrol et
    const existingReview = await prisma.productReview.findFirst({
      where: {
        id: parseInt(reviewId),
        userId: session.user.id,
        productId: parseInt(id),
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Yorumu sil
    await prisma.productReview.delete({
      where: {
        id: parseInt(reviewId),
      },
    });

    return NextResponse.json({
      message: 'Yorum başarıyla silindi',
    });
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 