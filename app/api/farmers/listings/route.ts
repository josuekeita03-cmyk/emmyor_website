import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/farmers/listings - Add raw materials listing (FARMER only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json({ error: "Forbidden - Only farmers can create listings" }, { status: 403 })
    }

    const body = await request.json()
    const { nameEn, nameAr, descriptionEn, descriptionAr, price, unit, origin, category, stock, image } = body

    // Validate required fields
    if (!nameEn || !nameAr || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields: nameEn, nameAr, price, category" },
        { status: 400 }
      )
    }

    // Get farmer profile
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id }
    })

    if (!farmer) {
      return NextResponse.json(
        { error: "Farmer profile not found" },
        { status: 404 }
      )
    }

    // Create product listing
    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        descriptionEn: descriptionEn || "",
        descriptionAr: descriptionAr || "",
        price: parseFloat(price),
        unit,
        origin,
        image,
        category,
        sku: `FARM-${Date.now()}`,
        stock: parseInt(stock) || 0,
        isActive: true,
        farmerId: farmer.id
      }
    })

    return NextResponse.json({ 
      success: true,
      product,
      message: "Raw material listing created successfully"
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating farmer listing:", error)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}

// GET /api/farmers/listings - Get farmer's listings (FARMER only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json({ error: "Forbidden - Only farmers can view their listings" }, { status: 403 })
    }

    // Get farmer profile
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id }
    })

    if (!farmer) {
      return NextResponse.json(
        { error: "Farmer profile not found" },
        { status: 404 }
      )
    }

    // Get farmer's product listings
    const products = await prisma.product.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching farmer listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    )
  }
}
