import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/track/list - Get all tracked products (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tracking = await prisma.productTracking.findMany({
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      tracking
    })
  } catch (error) {
    console.error("Error fetching tracking list:", error)
    return NextResponse.json(
      { error: "Failed to fetch tracking list", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
