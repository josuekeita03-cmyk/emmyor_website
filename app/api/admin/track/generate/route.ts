import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import QRCode from "qrcode"

// POST /api/admin/track/generate - Generate QR code for a product (ADMIN only)
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
    const { productId, batchNumber } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farmer: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.sku) {
      return NextResponse.json(
        { error: "Product must have a SKU to generate QR code" },
        { status: 400 }
      )
    }

    // Check if tracking already exists
    const existingTracking = await prisma.productTracking.findUnique({
      where: { productId }
    })

    if (existingTracking) {
      return NextResponse.json(
        { error: "QR code already generated for this product" },
        { status: 400 }
      )
    }

    // Generate tracking URL
    const trackingUrl = `https://emmyor.com/track/${product.sku}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    })

    // Create product tracking record
    const tracking = await prisma.productTracking.create({
      data: {
        productId,
        sku: product.sku,
        qrCodeUrl: qrCodeDataUrl,
        batchNumber: batchNumber || null
      }
    })

    return NextResponse.json({ 
      success: true,
      tracking,
      qrCodeDataUrl,
      trackingUrl
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json(
      { error: "Failed to generate QR code", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
