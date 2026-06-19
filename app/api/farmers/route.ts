import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/farmers - Get all farmers with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const location = searchParams.get("location")
    const experience = searchParams.get("experience")
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {}

    if (location) {
      where.farmLocation = { contains: location, mode: "insensitive" }
    }

    if (experience) {
      where.experience = parseInt(experience)
    }

    if (search) {
      where.OR = [
        { farmLocation: { contains: search, mode: "insensitive" } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const farmers = await prisma.farmer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    })

    // Get unique locations and experiences for filters (sorted)
    const locations = await prisma.farmer.findMany({
      select: { farmLocation: true },
      distinct: ["farmLocation"],
      where: { farmLocation: { not: null } },
      orderBy: { farmLocation: "asc" },
    })

    const experiences = await prisma.farmer.findMany({
      select: { experience: true },
      distinct: ["experience"],
      where: { experience: { not: null } },
      orderBy: { experience: "asc" },
    })

    return NextResponse.json({
      farmers,
      filters: {
        locations: locations
          .map((l) => l.farmLocation)
          .filter((l): l is string => l !== null)
          .sort((a, b) => a.localeCompare(b)),
        experiences: experiences
          .map((e) => e.experience)
          .filter((e): e is number => e !== null)
          .sort((a, b) => a - b),
      },
    })
  } catch (error) {
    console.error("Error fetching farmers:", error)
    return NextResponse.json({ error: "Failed to fetch farmers" }, { status: 500 })
  }
}
