import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TrackingType } from "@prisma/client"

// POST /api/admin/track/timeline - Add timeline entry for product tracking (ADMIN only)
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
    const { productId, stage, date, details, type } = body

    if (!productId || !stage || !date || !type) {
      return NextResponse.json(
        { error: "Missing required fields: productId, stage, date, type" },
        { status: 400 }
      )
    }

    // Validate tracking type
    if (!Object.values(TrackingType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid tracking type. Must be RECEPTION, PROCESSING, or PACKAGING" },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Create timeline entry
    const timeline = await prisma.trackingTimeline.create({
      data: {
        productId,
        stage,
        date: new Date(date),
        details: details || null,
        type: type as TrackingType
      }
    })

    return NextResponse.json({ 
      success: true,
      timeline
    })
  } catch (error) {
    console.error("Error creating timeline entry:", error)
    return NextResponse.json(
      { error: "Failed to create timeline entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/track/timeline - Update timeline entry (ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id, stage, date, details, type } = body

    if (!id) {
      return NextResponse.json(
        { error: "Timeline entry ID is required" },
        { status: 400 }
      )
    }

    // Validate tracking type if provided
    if (type && !Object.values(TrackingType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid tracking type. Must be RECEPTION, PROCESSING, or PACKAGING" },
        { status: 400 }
      )
    }

    // Update timeline entry
    const timeline = await prisma.trackingTimeline.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(date && { date: new Date(date) }),
        ...(details !== undefined && { details }),
        ...(type && { type: type as TrackingType })
      }
    })

    return NextResponse.json({ 
      success: true,
      timeline
    })
  } catch (error) {
    console.error("Error updating timeline entry:", error)
    return NextResponse.json(
      { error: "Failed to update timeline entry", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
