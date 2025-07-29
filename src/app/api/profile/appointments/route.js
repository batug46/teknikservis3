import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: { 
            name: true,
            email: true 
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Her randevuya fiyat bilgisini ekle
    const appointmentsWithPrice = await Promise.all(
      appointments.map(async (appointment) => {
        const serviceProduct = await prisma.product.findFirst({
          where: {
            name: appointment.serviceType,
            category: 'hizmet',
          },
          select: {
            price: true,
          },
        });

        return {
          ...appointment,
          price: serviceProduct?.price || 0,
        };
      })
    );

    return NextResponse.json(appointmentsWithPrice);

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 