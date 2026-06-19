import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email"

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create order from cart
export async function POST(request: NextRequest) {
  try {
    console.log("=== Order Creation Start ===")
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

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: user.customer.id },
      include: {
        product: true,
      },
    })
    console.log("Cart items found:", cartItems.length)

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const body = await request.json()
    const { shipping = 0, paymentMethod = "CARD", cardData } = body
    console.log("Payment method:", paymentMethod, "Shipping:", shipping)

    // If card payment, process through payment gateway
    if (paymentMethod === "CARD") {
      if (!cardData) {
        return NextResponse.json({ error: "Card data required for card payment" }, { status: 400 })
      }

      // Create order first
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          customerId: user.customer.id,
          total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) + shipping,
          status: "PENDING",
          paymentMethod: paymentMethod as any,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
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

      // Process card payment
      const paymentResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardData,
          orderId: order.id,
          amount: order.total,
        }),
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResponse.ok || !paymentResult.success) {
        // Payment failed, delete the order
        await prisma.order.delete({ where: { id: order.id } })
        return NextResponse.json(
          { error: paymentResult.error || "Payment processing failed" },
          { status: 400 }
        )
      }

      console.log("Payment successful:", paymentResult.transactionId)

      // Update product stock
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: { customerId: user.customer.id },
      })

      console.log("Cart cleared")

      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail(
          user.email,
          user.fullName || "Customer",
          order.id,
          order.total,
          cartItems.map(item => ({
            name: item.product.nameEn,
            quantity: item.quantity,
            price: item.product.price,
          }))
        )
        console.log("Order confirmation email sent")
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError)
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        transactionId: paymentResult.transactionId,
      })
    }

    // For non-card payments (Bank Transfer, WhatsApp)
    // Check stock availability
    for (const item of cartItems) {
      if ((item.product.stock ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product.nameEn}` },
          { status: 400 }
        )
      }
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) + shipping
    console.log("Order total:", total)

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerId: user.customer.id,
        total,
        status: paymentMethod === "WHATSAPP" ? "WHATSAPP_PENDING" : "PENDING",
        paymentMethod: paymentMethod as any,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
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

    // Update product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { customerId: user.customer.id },
    })
    console.log("Cart cleared")

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        user.email,
        user.fullName || "Customer",
        order.id,
        total,
        cartItems.map(item => ({
          name: item.product.nameEn,
          quantity: item.quantity,
          price: item.product.price,
        }))
      )
      console.log("Order confirmation email sent")
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError)
    }

    console.log("=== Order Creation End ===")
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
