import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/products/:id - Get product details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                city: true,
              },
            },
          },
        },
        producer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                city: true,
              },
            },
          },
        },
        productReviews: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT /api/products/:id - Update product (FARMER or ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN" && userRole !== "FARMER" && userRole !== "INDIVIDUAL_PRODUCER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user owns this product (unless admin)
    if (userRole !== "ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          farmer: true,
          individualProducer: true,
        },
      })

      if (
        (userRole === "FARMER" && product.farmerId !== user?.farmer?.id) ||
        (userRole === "INDIVIDUAL_PRODUCER" && product.producerId !== user?.individualProducer?.id)
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await request.json()
    const {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      price,
      unit,
      origin,
      packaging,
      image,
      category,
      sku,
      stock,
      isActive,
    } = body

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(nameEn !== undefined && { nameEn }),
        ...(nameAr !== undefined && { nameAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(unit !== undefined && { unit }),
        ...(origin !== undefined && { origin }),
        ...(packaging !== undefined && { packaging }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(sku !== undefined && { sku }),
        ...(stock !== undefined && { stock }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id - Delete product (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
