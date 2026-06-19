import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/stats - Get dashboard statistics (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total revenue (from completed orders)
    const completedOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["DELIVERED", "PROCESSING"]
        }
      },
      select: {
        total: true
      }
    })
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)

    // Get active orders count
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING", "SHIPPED"]
        }
      }
    })

    // Get pending approvals (farmer registrations with PENDING status)
    const pendingApprovals = await prisma.user.count({
      where: {
        role: "FARMER",
        isActive: false
      }
    })

    // Get low stock products (stock < 10)
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lt: 10
        }
      }
    })

    // Get total products
    const totalProducts = await prisma.product.count()

    // Get total orders
    const totalOrders = await prisma.order.count()

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        createdAt: true,
        isActive: true
      }
    })

    // Get WhatsApp orders count
    const whatsappOrders = await prisma.order.count({
      where: {
        paymentMethod: "WHATSAPP"
      }
    })

    // Get pending WhatsApp orders
    const pendingWhatsAppOrders = await prisma.order.count({
      where: {
        paymentMethod: "WHATSAPP",
        status: "WHATSAPP_PENDING"
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalRevenue,
        activeOrders,
        pendingApprovals,
        lowStockProducts,
        totalProducts,
        totalOrders,
        whatsappOrders,
        pendingWhatsAppOrders
      },
      recentOrders,
      recentUsers
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    )
  }
}
