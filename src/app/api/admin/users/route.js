// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// .env dosyasından okunan değeri kullan, yoksa bir varsayılan belirle (ama .env kullanmalısın)
const JWT_SECRET = process.env.JWT_SECRET || 'SENIN_COK_GUCLU_VE_OZEL_ANAHTARIN_BURAYA';

// Diğer kodlar aynı kalacak
// ...

// Yardımcı Fonksiyon: Token'ı doğrulayan ve admin yetkisini kontrol eden fonksiyon
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Yetkilendirme token\'ı bulunamadı veya formatı yanlış.', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return { error: 'Yetkisiz erişim. Sadece adminler bu işlemi yapabilir.', status: 403 };
    }

    return { user: decoded };
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return { error: 'Geçersiz veya süresi dolmuş token.', status: 401 };
    }
    console.error("Token doğrulama hatası:", err);
    return { error: 'Sunucu hatası.', status: 500 };
  }
}

/**
 * @description Tüm kullanıcıları listeler (Sadece adminler için).
 * GET /api/admin/users
 */
export async function GET(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: { // Şifre alanını hariç tutuyoruz
        id: true,
        email: true,
        name: true,
        adSoyad: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    return NextResponse.json({ error: 'Kullanıcılar getirilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir kullanıcıyı siler (Sadece adminler için ve admin rolünü silmez).
 * DELETE /api/admin/users?id=<user_id>
 */
export async function DELETE(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Silinecek kullanıcının ID bilgisi gereklidir.' }, { status: 400 });
    }

    const userId = parseInt(id);

    // Kullanıcının rolünü kontrol et: admin rolündeki bir kullanıcıyı silmeyi engelle
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    if (userToDelete.role === 'admin') {
      return NextResponse.json({ error: 'Admin rolündeki kullanıcı silinemez.' }, { status: 403 });
    }
    
    // Kullanıcıya ait siparişler veya randevular gibi bağımlılıkları silmeniz gerekebilir.
    // Prisma'da onDelete ayarlanmamışsa, bu hata verir.
    // Örnek: await prisma.order.deleteMany({ where: { userId: userId } });
    // Örnek: await prisma.appointment.deleteMany({ where: { userId: userId } });

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Kullanıcı başarıyla silindi.' });
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    return NextResponse.json({ error: 'Kullanıcı silinirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir kullanıcının rolünü günceller (Sadece adminler için ve admin rolünü "admin" yapmaya veya "admin" rolünden değiştirmeye izin vermez).
 * PUT /api/admin/users
 */
export async function PUT(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: 'Kullanıcı ID ve yeni rol bilgisi gereklidir.' }, { status: 400 });
    }

    const userId = parseInt(id);

    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Admin kullanıcısının rolünü değiştirmeyi engelle
    if (userToUpdate.role === 'admin') {
        return NextResponse.json({ error: 'Admin rolündeki kullanıcının rolü değiştirilemez.' }, { status: 403 });
    }
    
    // Eğer yeni rol 'admin' ise, bu API üzerinden yükseltmeyi engelle.
    // Sadece mevcut rolü 'admin' olmayan kullanıcıların rolü 'user' olarak ayarlanabilir.
    if (role === 'admin') {
        return NextResponse.json({ error: 'Bu API üzerinden kullanıcıyı admin rolüne yükseltemezsiniz. Lütfen `create-admin` scriptini kullanın.' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role },
      select: { // Şifre alanını hariç tutuyoruz
        id: true,
        email: true,
        name: true,
        adSoyad: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı rolü güncellenirken hata:', error);
    return NextResponse.json({ error: 'Kullanıcı rolü güncellenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}