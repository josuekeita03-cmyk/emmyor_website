import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/farmers/offers - Get pending offers for the farmer
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "FARMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the farmer's profile
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id }
    })

    if (!farmer) {
      return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })
    }

    // Get the farmer's products
    const farmerProducts = await prisma.product.findMany({
      where: { farmerId: farmer.id }
    })

    const farmerProductIds = farmerProducts.map(p => p.id)

    // Get orders that contain the farmer's products and are pending (including WhatsApp orders)
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "WHATSAPP_PENDING"]
        },
        orderItems: {
          some: {
            productId: {
              in: farmerProductIds
            }
          }
        }
      },
      include: {
        orderItems: {
          where: {
            productId: {
              in: farmerProductIds
            }
          },
          include: {
            product: true
          }
        },
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform orders into offers format
    const offers = orders.flatMap(order => 
      order.orderItems.map(item => ({
        id: `${order.id}-${item.id}`,
        orderId: order.id,
        productId: item.productId,
        product: item.product.nameEn,
        quantity: item.quantity,
        pricePerUnit: item.price,
        total: item.quantity * item.price,
        customer: order.user.fullName,
        customerEmail: order.user.email,
        customerPhone: order.user.phoneNumber,
        orderDate: order.createdAt
      }))
    )

    return NextResponse.json({ offers })
  } catch (error) {
    console.error("Error fetching farmer offers:", error)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}
