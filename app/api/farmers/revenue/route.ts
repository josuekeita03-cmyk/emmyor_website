import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/farmers/revenue - Get monthly revenue for the farmer
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

    // Get orders that contain the farmer's products
    const orders = await prisma.order.findMany({
      where: {
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
          }
        }
      }
    })

    // Calculate revenue for current month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    let monthlyRevenue = 0
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt)
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        // Calculate only the revenue from this farmer's products
        const farmerOrderItems = order.orderItems.filter(item => 
          farmerProductIds.includes(item.productId)
        )
        const farmerOrderTotal = farmerOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        monthlyRevenue += farmerOrderTotal
      }
    })

    return NextResponse.json({ monthlyRevenue })
  } catch (error) {
    console.error("Error fetching farmer revenue:", error)
    return NextResponse.json({ error: "Failed to fetch revenue" }, { status: 500 })
  }
}
