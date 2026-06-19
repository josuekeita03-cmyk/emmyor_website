import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/products - Get all products with pagination and filters (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "COMMERCIAL") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    const where: any = {}
    if (category && category !== "all") {
      where.category = category
    }
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          farmer: {
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/admin/products - Create a new product (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
      isActive = true
    } = body

    // Validate required fields
    if (!nameEn || !nameAr || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields: nameEn, nameAr, price, category" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        descriptionEn: descriptionEn || "",
        descriptionAr: descriptionAr || "",
        price: parseFloat(price),
        unit,
        origin,
        packaging,
        image,
        category,
        sku,
        stock: parseInt(stock) || 0,
        isActive
      }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
