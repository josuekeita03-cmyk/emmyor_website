import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/track/:productId/scan - Log scan analytics for a product QR code
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params
    const body = await request.json()
    const { userAgent, referrer } = body

    // Get product tracking information
    const tracking = await prisma.productTracking.findUnique({
      where: { productId },
      include: {
        product: true
      }
    })

    if (!tracking) {
      return NextResponse.json(
        { error: "Product not found or tracking not enabled" },
        { status: 404 }
      )
    }

    // For now, we'll just log the scan. In a production environment,
    // you might want to create a separate scans table for analytics
    console.log(`QR Code scanned for Product ID: ${productId}`, {
      userAgent,
      referrer,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: "Scan logged successfully",
      tracking
    })
  } catch (error) {
    console.error("Error logging scan:", error)
    return NextResponse.json(
      { error: "Failed to log scan", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
