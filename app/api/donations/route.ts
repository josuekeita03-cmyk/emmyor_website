import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendDonationConfirmationEmail, sendDonationNotificationToFarmer, getUserLocale } from "@/lib/email"
import { authOptions } from "@/lib/auth"

// Validation schema for donation
const donationSchema = z.object({
  farmerId: z.string().optional(),
  campaignId: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("MAD"),
  message: z.string().optional(),
  paymentMethod: z.enum(["CMI", "STRIPE"]),
  cardDetails: z.object({
    cardNumber: z.string(),
    cardHolder: z.string(),
    expiryDate: z.string(),
    cvv: z.string(),
  }).optional(),
  locale: z.string().default("en"),
})

// POST /api/donations - Create a donation with payment simulation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow donations from authenticated users (CUSTOMER or COMPANY)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    console.log("Donation request - User role:", userRole, "User ID:", session.user.id)
    
    if (userRole !== "CUSTOMER" && userRole !== "COMPANY") {
      return NextResponse.json({ error: "Only customers and companies can make donations" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = donationSchema.parse(body)

    // Get user's preferred locale
    const userLocale = await getUserLocale(session.user?.id || "")
    const locale = validatedData.locale || userLocale

    // Payment simulation (like module 3)
    let paymentStatus = "COMPLETED"
    let transactionId = null
    let gatewayResponse = null

    if (validatedData.paymentMethod === "CMI") {
      // Simulate CMI payment
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
      transactionId = `CMI-${Date.now()}`
      gatewayResponse = {
        status: "success",
        message: "Payment processed via CMI",
        gateway: "CMI",
      }
    } else if (validatedData.paymentMethod === "STRIPE") {
      // Simulate Stripe payment
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
      transactionId = `STRIPE-${Date.now()}`
      gatewayResponse = {
        status: "success",
        message: "Payment processed via Stripe",
        gateway: "STRIPE",
      }
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        donorId: session.user?.id,
        farmerId: validatedData.farmerId && validatedData.farmerId !== "none" ? validatedData.farmerId : null,
        companyId: userRole === "COMPANY" ? session.user?.id : null,
        campaignId: validatedData.campaignId && validatedData.campaignId !== "none" ? validatedData.campaignId : null,
        amount: validatedData.amount,
        currency: validatedData.currency,
        paymentStatus: paymentStatus as any,
        message: validatedData.message,
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
        campaign: true,
      },
    })

    // If donation is linked to a campaign, update campaign progress
    if (validatedData.campaignId) {
      await prisma.donationCampaign.update({
        where: { id: validatedData.campaignId },
        data: {
          currentAmount: {
            increment: validatedData.amount,
          },
        },
      })
    }

    // Send confirmation email to donor
    const donorName = (session.user as any)?.fullName || session.user?.name || "Donor"
    const donorEmail = session.user?.email || ""
    
    if (donorEmail) {
      await sendDonationConfirmationEmail(
        donorEmail,
        donorName,
        validatedData.amount,
        validatedData.currency,
        donation.farmer?.user.fullName,
        donation.campaign?.title,
        locale
      )
    }

    // Send notification to farmer if applicable
    if (donation.farmer && donorEmail) {
      await sendDonationNotificationToFarmer(
        donation.farmer.user.email,
        donation.farmer.user.fullName,
        donorName,
        validatedData.amount,
        validatedData.currency,
        validatedData.message
      )
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        paymentStatus: donation.paymentStatus,
        transactionId,
        gatewayResponse,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}
