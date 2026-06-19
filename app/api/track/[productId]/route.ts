import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/track/:productId - Get tracking information for a product by product ID
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params

    // Get product tracking information by product ID
    const tracking = await prisma.productTracking.findUnique({
      where: { productId },
      include: {
        product: {
          include: {
            farmer: {
              include: {
                user: true
              }
            },
            trackingTimeline: {
              orderBy: { date: 'asc' }
            }
          }
        }
      }
    })

    if (!tracking) {
      return NextResponse.json(
        { error: "Product not found or tracking not enabled" },
        { status: 404 }
      )
    }

    // Get farmer media (videos/images)
    const farmMedia = await prisma.farmMedia.findMany({
      where: { farmerId: tracking.product.farmerId || "" },
      orderBy: { createdAt: 'desc' }
    })

    // Get donation campaigns for this farmer
    const donationCampaigns = await prisma.donationCampaign.findMany({
      where: { 
        farmerId: tracking.product.farmerId || "",
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      tracking,
      farmMedia,
      donationCampaigns
    })
  } catch (error) {
    console.error("Error fetching tracking information:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracking information", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
