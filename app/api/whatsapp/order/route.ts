import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderConfirmationEmail, sendWhatsAppOrderReceivedEmail } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

// POST /api/whatsapp/order - Create WhatsApp order
export async function POST(request: NextRequest) {
  try {
    console.log("=== WhatsApp Order Start ===")
    
    // Rate limiting - prevent abuse
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`whatsapp-order:${ip}`, 10, 15 * 60 * 1000) // 10 orders per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many WhatsApp order attempts. Please try again later." }, { status: 429 })
    }
    
    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.id)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customer: true,
      },
    })
    console.log("User found:", !!user, "Customer:", !!user?.customer)

    if (!user?.customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const body = await request.json()
    const { items, whatsappNumber, customerNote, customerAddress } = body
    console.log("Items:", items, "WhatsApp number:", whatsappNumber, "Note:", customerNote, "Address:", customerAddress)

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    if (!whatsappNumber) {
      return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 })
    }

    // Validate items and calculate total
    let total = 0
    const orderItems = []

    for (const item of items) {
      console.log("Processing item:", item.productId)
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product is not available: ${product.nameEn}` },
          { status: 400 }
        )
      }

      if ((product.stock ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.nameEn}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      })
    }

    console.log("Creating order with total:", total)
    // Create order with WHATSAPP_PENDING status
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerId: user.customer.id,
        total,
        status: "WHATSAPP_PENDING",
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })
    console.log("Order created:", order.id)

    // Get WhatsApp settings
    let whatsappSettings
    try {
      whatsappSettings = await prisma.whatsappSettings.findFirst({
        where: { isActive: true },
      })
      console.log("WhatsApp settings found:", !!whatsappSettings)
    } catch (error) {
      console.log("WhatsApp settings table might not exist yet, using customer number")
    }

    // Use admin WhatsApp number if configured, otherwise use customer's number
    const phoneNumber = whatsappSettings?.phoneNumber || whatsappNumber
    console.log("Using phone number:", phoneNumber)

    // Build WhatsApp message (using new format, ignoring database template)
    const orderIdShort = order.id.substring(0, 8).toUpperCase()
    let message = `New EMMYOR Order #ORD-${orderIdShort}\n`
    message += `Customer: ${user.fullName || "N/A"} | Tel: ${whatsappNumber}\n`
    message += `Delivery: ${customerAddress || "Not specified"}\n\n`
    message += "Items ordered:\n"

    for (const item of order.orderItems) {
      message += `- ${item.product.nameEn} x${item.quantity} = ${item.price * item.quantity} DH\n`
    }

    message += `\nTOTAL: ${total} DH`
    if (customerNote) {
      message += `\nNote: ${customerNote}`
    }

    // Create WhatsApp order record
    let whatsappOrder
    try {
      whatsappOrder = await prisma.whatsappOrder.create({
        data: {
          orderId: order.id,
          whatsappNumber: phoneNumber,
          messageSent: message,
          status: "SENT",
          sentAt: new Date(),
        },
      })
      console.log("WhatsApp order record created")
    } catch (error) {
      console.log("WhatsApp order table might not exist yet, skipping record creation")
    }

    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodedMessage}`
    console.log("WhatsApp URL generated:", whatsappUrl)

    console.log("=== WhatsApp Order End ===")
    
    // Send order confirmation email for WhatsApp orders
    try {
      await sendOrderConfirmationEmail(
        user.email,
        user.fullName || "Customer",
        order.id,
        total,
        order.orderItems.map(item => ({
          name: item.product.nameEn,
          quantity: item.quantity,
          price: item.price,
        }))
      )
    } catch (emailError) {
      console.error("Failed to send WhatsApp order confirmation email:", emailError)
      // Don't fail the order if email fails
    }

    // Send WhatsApp order received notification to administrators
    try {
      await sendWhatsAppOrderReceivedEmail(
        order.id,
        user.fullName || "Customer",
        user.email,
        user.phoneNumber || whatsappNumber,
        order.orderItems.map(item => ({
          name: item.product.nameEn,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
        whatsappNumber
      )
    } catch (emailError) {
      console.error("Failed to send WhatsApp order notification to admin:", emailError)
      // Don't fail the order if email fails
    }
    
    return NextResponse.json({
      order,
      whatsappOrder,
      whatsappUrl,
    })
  } catch (error) {
    console.error("Error creating WhatsApp order:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to create WhatsApp order", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
