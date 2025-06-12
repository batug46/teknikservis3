// Dosya Yolu: src/app/api/admin/stats/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);
    return NextResponse.json({ totalUsers, totalProducts, totalOrders });
  } catch (error) {
    return NextResponse.json({ error: "Veriler alınamadı." }, { status: 500 });
  }
}