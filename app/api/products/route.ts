import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/products - List products with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const origin = searchParams.get("origin")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const locale = searchParams.get("locale") || "en"

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (origin) {
      where.origin = origin
    }

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { descriptionAr: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
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
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Transform products based on locale
    const localizedProducts = products.map((product: any) => {
      if (locale === "ar") {
        return {
          ...product,
          name: product.nameAr || product.nameEn,
          description: product.descriptionAr || product.descriptionEn,
        }
      }
      return {
        ...product,
        name: product.nameEn,
        description: product.descriptionEn,
      }
    })

    return NextResponse.json({
      products: localizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      locale,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product (FARMER or ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN" && userRole !== "FARMER" && userRole !== "INDIVIDUAL_PRODUCER") {
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
    } = body

    // Validate required fields
    if (!nameEn || !nameAr || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields (nameEn, nameAr, price, category)" },
        { status: 400 }
      )
    }

    // Get user's farmer or producer profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        farmer: true,
        individualProducer: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const productData: any = {
      nameEn,
      nameAr,
      descriptionEn: descriptionEn || "",
      descriptionAr: descriptionAr || "",
      price: parseFloat(price),
      unit: unit || "kg",
      origin: origin || "Morocco",
      packaging: packaging || "",
      image: image || "",
      category,
      sku: sku || "",
      stock: stock || 0,
      isActive: true,
    }

    if (userRole === "FARMER" && user.farmer) {
      productData.farmerId = user.farmer.id
    } else if (userRole === "INDIVIDUAL_PRODUCER" && user.individualProducer) {
      productData.producerId = user.individualProducer.id
    } else if (userRole === "ADMIN") {
      // Admin can assign to any farmer/producer
      if (body.farmerId) productData.farmerId = body.farmerId
      if (body.producerId) productData.producerId = body.producerId
    }

    const product = await prisma.product.create({
      data: productData,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
