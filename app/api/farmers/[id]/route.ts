import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/farmers/:id - Public bio layout (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            fullName: true,
            email: false, // Don't expose email publicly
            phoneNumber: false, // Don't expose phone publicly
            city: true,
            createdAt: true,
          }
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            unit: true,
            origin: true,
            category: true,
            image: true,
            stock: true,
          }
        },
        farmMedia: true
      }
    })

    if (!farmer) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 })
    }

    // Get farmer registration status
    const registration = await prisma.farmerRegistration.findFirst({
      where: { userId: farmer.userId },
      select: {
        status: true,
        farmName: true,
        location: true,
        products: true,
        certifications: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      farmer: {
        id: farmer.id,
        name: farmer.user.fullName,
        farmName: registration?.farmName || farmer.user.fullName,
        location: registration?.location || farmer.farmLocation || farmer.user.city,
        experience: farmer.experience,
        certifications: farmer.certifications || registration?.certifications,
        registrationStatus: registration?.status,
        memberSince: farmer.user.createdAt,
        products: farmer.products,
        farmMedia: farmer.farmMedia,
      }
    })
  } catch (error) {
    console.error("Error fetching farmer bio:", error)
    return NextResponse.json(
      { error: "Failed to fetch farmer bio" },
      { status: 500 }
    )
  }
}
