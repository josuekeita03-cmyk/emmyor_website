import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

// Validation schema for campaign creation
const campaignSchema = z.object({
  farmerId: z.string().min(1, "Farmer ID is required"),
  title: z.string().min(2, "Title is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  deadline: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/donation-campaigns - Get all active campaigns
export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

// POST /api/donation-campaigns - Create a new campaign (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = campaignSchema.parse(body)

    const campaign = await prisma.donationCampaign.create({
      data: {
        farmerId: validatedData.farmerId,
        title: validatedData.title,
        targetAmount: validatedData.targetAmount,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        status: "ACTIVE",
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
