import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

const PROTECTED_EMAIL = 'admin@teknikservis.com';

// Kullanıcı rolünü güncelle
export async function PUT(request, { params }) {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Geçersiz kullanıcı ID.' }, { status: 400 });
    }
    const { role, emailVerified } = await request.json();

    if (!role || (role !== 'admin' && role !== 'user')) {
        return NextResponse.json({ error: 'Geçersiz rol.' }, { status: 400 });
    }

    try {
        const userToUpdate = await prisma.user.findUnique({
            where: { id },
        });

        if (!userToUpdate) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        if (userToUpdate.email === PROTECTED_EMAIL) {
            return NextResponse.json({ error: 'Ana adminin rolü değiştirilemez.' }, { status: 403 });
        }

        const updateData = { role };
        if (emailVerified !== undefined) {
            updateData.emailVerified = emailVerified;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Kullanıcı güncellenirken hata:', error);
        return NextResponse.json({ error: 'Kullanıcı rolü güncellenemedi.' }, { status: 500 });
    }
}

// Kullanıcıyı ve ilişkili tüm verilerini sil
export async function DELETE(request, { params }) {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Geçersiz kullanıcı ID.' }, { status: 400 });
    }

    try {
        const userToDelete = await prisma.user.findUnique({
            where: { id },
        });

        if (!userToDelete) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        if (userToDelete.email === PROTECTED_EMAIL) {
            return NextResponse.json({ error: 'Ana admin silinemez.' }, { status: 403 });
        }

        // İlişkili tüm verileri tek bir transaction içinde sil
        await prisma.$transaction(async (tx) => {
            // Önce OrderItem'ları sil (Order'larla ilişkili)
            await tx.orderItem.deleteMany({
                where: {
                    order: {
                        userId: id
                    }
                }
            });
            
            // Sonra Order'ları sil
            await tx.order.deleteMany({ 
                where: { userId: id } 
            });
            
            // Appointment'ları sil
            await tx.appointment.deleteMany({ 
                where: { userId: id } 
            });
            
            // PrivateMessage'ları sil (hem gönderdiği hem aldığı)
            await tx.privateMessage.deleteMany({ 
                where: { 
                    OR: [
                        { senderId: id }, 
                        { recipientId: id }
                    ] 
                } 
            });
            
            // Son olarak User'ı sil
            await tx.user.delete({ 
                where: { id } 
            });
        });

        return NextResponse.json({ message: 'Kullanıcı ve ilişkili tüm verileri başarıyla silindi.' });
    } catch (error) {
        console.error('Kullanıcı silinirken hata:', error);
        return NextResponse.json({ error: 'Kullanıcı silinemedi. Lütfen tekrar deneyin.' }, { status: 500 });
    }
}