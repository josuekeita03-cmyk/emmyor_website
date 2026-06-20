import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/farmers - Fetch all farmers (ADMIN only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const farmers = await prisma.farmer.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        user: {
          fullName: "asc",
        },
      },
    })

    return NextResponse.json({ farmers })
  } catch (error) {
    console.error("Error fetching farmers:", error)
    return NextResponse.json({ error: "Failed to fetch farmers" }, { status: 500 })
  }
}
