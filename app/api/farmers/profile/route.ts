import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/farmers/profile - Check if user has an approved farmer profile (FARMER only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FARMER") {
      return NextResponse.json({ error: "Forbidden - Only farmers can access this endpoint" }, { status: 403 })
    }

    // Check if user has a farmer profile
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id }
    })

    if (!farmer) {
      return NextResponse.json({ error: "Farmer profile not found" }, { status: 404 })
    }

    // Check if farmer registration is approved
    const registration = await prisma.farmerRegistration.findFirst({
      where: { userId: session.user.id }
    })

    if (!registration || registration.status !== "APPROVED") {
      return NextResponse.json({ error: "Farmer registration not approved" }, { status: 403 })
    }

    return NextResponse.json({ 
      farmer,
      registration 
    })
  } catch (error) {
    console.error("Error fetching farmer profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch farmer profile" },
      { status: 500 }
    )
  }
}
