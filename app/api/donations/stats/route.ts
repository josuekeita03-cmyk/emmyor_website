import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/donations/stats - Get donation statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const farmerId = searchParams.get("farmerId")
    const campaignId = searchParams.get("campaignId")

    // Build where clause
    const where: any = {}
    if (farmerId) where.farmerId = farmerId
    if (campaignId) where.campaignId = campaignId

    // Get total donations count and amount
    const totalDonations = await prisma.donation.count({ where })
    const totalAmount = await prisma.donation.aggregate({
      where,
      _sum: {
        amount: true,
      },
    })

    // Get donations by payment status
    const donationsByStatus = await prisma.donation.groupBy({
      by: ["paymentStatus"],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    })

    // Get recent donations
    const recentDonations = await prisma.donation.findMany({
      where,
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        company: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        campaign: {
          select: {
            title: true,
            targetAmount: true,
            currentAmount: true,
          },
        },
      },
    })

    // Get campaign statistics if campaignId is provided
    let campaignStats = null
    if (campaignId) {
      const campaign = await prisma.donationCampaign.findUnique({
        where: { id: campaignId },
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
      if (campaign) {
        campaignStats = {
          id: campaign.id,
          title: campaign.title,
          targetAmount: campaign.targetAmount,
          currentAmount: campaign.currentAmount,
          progress: (campaign.currentAmount / campaign.targetAmount) * 100,
          status: campaign.status,
          deadline: campaign.deadline,
          farmer: campaign.farmer?.user.fullName,
        }
      }
    }

    return NextResponse.json({
      totalDonations,
      totalAmount: totalAmount._sum.amount || 0,
      donationsByStatus: donationsByStatus.map((stat) => ({
        status: stat.paymentStatus,
        count: stat._count,
        amount: stat._sum.amount || 0,
      })),
      recentDonations,
      campaignStats,
    })
  } catch (error) {
    console.error("Error fetching donation stats:", error)
    return NextResponse.json({ error: "Failed to fetch donation stats" }, { status: 500 })
  }
}
