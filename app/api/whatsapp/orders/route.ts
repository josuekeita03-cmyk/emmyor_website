import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/whatsapp/orders - Get WhatsApp orders (ADMIN/COMMERCIAL only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const where: any = {}

    if (status) {
      where.status = status
    }

    const whatsappOrders = await prisma.whatsappOrder.findMany({
      where,
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    })

    return NextResponse.json({ whatsappOrders })
  } catch (error) {
    console.error("Error fetching WhatsApp orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp orders" },
      { status: 500 }
    )
  }
}
