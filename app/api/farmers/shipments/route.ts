import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/farmers/shipments - Get active shipments for the farmer
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

    // Get orders that contain the farmer's products and are in transit (PROCESSING or SHIPPED)
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PROCESSING", "SHIPPED"]
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
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform orders into shipments format
    const shipments = orders.flatMap(order => 
      order.orderItems.map(item => ({
        id: `${order.id}-${item.id}`,
        orderId: order.id,
        productId: item.productId,
        product: item.product.nameEn,
        quantity: item.quantity,
        status: order.status === "SHIPPED" ? "In Transit" : "Processing",
        customer: order.user.fullName,
        customerEmail: order.user.email,
        orderDate: order.createdAt,
        estimatedDelivery: order.status === "SHIPPED" 
          ? new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : "TBD"
      }))
    )

    return NextResponse.json({ shipments })
  } catch (error) {
    console.error("Error fetching farmer shipments:", error)
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 })
  }
}
