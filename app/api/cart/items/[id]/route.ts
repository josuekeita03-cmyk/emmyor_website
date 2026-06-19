import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PUT /api/cart/items/:id - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customer: true,
      },
    })

    if (!user?.customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { product: true },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    if (cartItem.customerId !== user.customer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { quantity } = body

    if (quantity === undefined) {
      return NextResponse.json(
        { error: "Missing quantity field" },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      )
    }

    if ((cartItem.product.stock ?? 0) < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json(updatedCartItem)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/items/:id - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customer: true,
      },
    })

    if (!user?.customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
    })

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    if (cartItem.customerId !== user.customer.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    )
  }
}
