import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// POST /api/donations/webhook - Handle payment gateway webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get("x-signature")

    // Verify webhook signature (for security)
    // In production, you would verify the signature using the gateway's secret key
    // For now, we'll skip signature verification in simulation mode
    const webhookSecret = process.env.DONATION_WEBHOOK_SECRET || "test_secret"
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(body))
      .digest("hex")

    if (signature && signature !== expectedSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const { event, data } = body

    // Handle different webhook events
    switch (event) {
      case "payment.completed":
        // Update donation status to COMPLETED
        if (data.donationId) {
          await prisma.donation.update({
            where: { id: data.donationId },
            data: {
              paymentStatus: "COMPLETED",
            },
          })

          // Update campaign if applicable
          const donation = await prisma.donation.findUnique({
            where: { id: data.donationId },
            include: { campaign: true },
          })

          if (donation?.campaignId) {
            await prisma.donationCampaign.update({
              where: { id: donation.campaignId },
              data: {
                currentAmount: {
                  increment: donation.amount,
                },
              },
            })
          }

          // Send confirmation email (to be implemented)
          // await sendDonationConfirmationEmail(donation)
        }
        break

      case "payment.failed":
        // Update donation status to FAILED
        if (data.donationId) {
          await prisma.donation.update({
            where: { id: data.donationId },
            data: {
              paymentStatus: "FAILED",
            },
          })
        }
        break

      case "payment.refunded":
        // Update donation status to REFUNDED
        if (data.donationId) {
          await prisma.donation.update({
            where: { id: data.donationId },
            data: {
              paymentStatus: "REFUNDED",
            },
          })

          // Update campaign if applicable
          const donation = await prisma.donation.findUnique({
            where: { id: data.donationId },
          })

          if (donation?.campaignId) {
            await prisma.donationCampaign.update({
              where: { id: donation.campaignId },
              data: {
                currentAmount: {
                  decrement: donation.amount,
                },
              },
            })
          }
        }
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
