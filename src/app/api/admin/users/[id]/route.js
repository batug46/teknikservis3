import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    const userToDelete = await prisma.user.findUnique({ where: { id } });

    if (userToDelete?.role === 'admin') {
      return NextResponse.json({ error: 'Admin kullanıcıları silinemez.' }, { status: 403 });
    }
    
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'Kullanıcı silindi' });
  } catch (error) {
    if (error.code === 'P2003') {
       return NextResponse.json({ error: 'Kullanıcı silinemedi. Kullanıcının aktif siparişleri veya randevuları olabilir.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const { role } = await request.json();

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json({ error: 'Geçersiz rol.' }, { status: 400 });
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (userToUpdate?.role === 'admin') {
      return NextResponse.json({ error: 'Admin kullanıcısının rolü değiştirilemez.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });
    return NextResponse.json({ message: 'Rol güncellendi' });
  } catch (error) {
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}