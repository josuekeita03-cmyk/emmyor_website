import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

// PUT /api/orders/:id/status - Update order status (COMMERCIAL/ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: "Missing status field" },
        { status: 400 }
      )
    }

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "WHATSAPP_PENDING", "CONFIRMED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // Send status update email to customer
    try {
      await sendOrderStatusUpdateEmail(
        order.user.email,
        order.user.fullName || "Customer",
        order.id,
        status
      )
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError)
      // Don't fail the status update if email fails
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    )
  }
}
