// src/app/api/admin/appointments/route.js
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
 * @description Tüm randevuları getirir (Sadece adminler için).
 * GET /api/admin/appointments
 */
export async function GET(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: { // Randevuyu alan kullanıcı bilgilerini dahil et
          select: {
            name: true,
            email: true,
            adSoyad: true,
            phone: true,
          },
        },
      },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Randevular getirilirken hata:', error);
    return NextResponse.json({ error: 'Randevular getirilirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir randevunun durumunu günceller (Sadece adminler için).
 * PUT /api/admin/appointments
 */
export async function PUT(request) {
  const authResult = await verifyAdmin(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }
  
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Randevu ID ve yeni durum bilgisi gereklidir.' }, { status: 400 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { status: status },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Randevu durumu güncellenirken hata:', error);
    return NextResponse.json({ error: 'Randevu durumu güncellenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

/**
 * @description Bir randevuyu siler (Sadece adminler için).
 * DELETE /api/admin/appointments?id=<randevu_id>
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
      return NextResponse.json({ error: 'Silinecek randevunun ID bilgisi gereklidir.' }, { status: 400 });
    }
    
    await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Randevu başarıyla silindi.' });
  } catch (error) {
    console.error('Randevu silinirken hata:', error);
    return NextResponse.json({ error: 'Randevu silinirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}