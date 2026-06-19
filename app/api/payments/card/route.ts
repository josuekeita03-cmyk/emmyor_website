import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

// Card Payment Processing API
// This endpoint processes card payments through the payment gateway
// For production, integrate with CMI (Morocco) or Stripe/Stripe

// Payment request schema
const paymentRequestSchema = z.object({
  cardData: z.object({
    cardNumber: z.string().min(13).max(19),
    cardholderName: z.string().min(2),
    expiryDate: z.string().min(5).max(5),
    cvv: z.string().min(3).max(4),
  }),
  orderId: z.string().optional(),
  amount: z.number().min(0.01),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== Card Payment Processing Start ===")
    
    // Rate limiting - prevent abuse
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`payment:${ip}`, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many payment attempts. Please try again later." }, { status: 429 })
    }
    
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Authorization check - only authenticated users can make payments
    const userRole = session.user.role
    if (userRole !== "CUSTOMER" && userRole !== "COMPANY") {
      return NextResponse.json({ error: "Forbidden - Only customers and companies can make payments" }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Validate input with Zod schema
    const validatedData = paymentRequestSchema.parse(body)
    const { cardData, orderId, amount } = validatedData

    // Clean card number
    const cardNumber = cardData.cardNumber.replace(/\s/g, "")
    
    // Validate card number length (accept 13-19 digits for all card types)
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return NextResponse.json({ error: "Invalid card number length" }, { status: 400 })
    }

    // Detect card type
    let cardType = "UNKNOWN"
    if (/^4/.test(cardNumber)) cardType = "VISA"
    else if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) cardType = "MASTERCARD"
    else if (/^3[47]/.test(cardNumber)) cardType = "AMERICAN_EXPRESS"
    else if (/^6/.test(cardNumber)) cardType = "CMI"

    // Validate accepted card types
    const acceptedCardTypes = ["VISA", "MASTERCARD", "CMI", "AMERICAN_EXPRESS"]
    if (!acceptedCardTypes.includes(cardType)) {
      return NextResponse.json({ error: `Card type ${cardType} is not accepted` }, { status: 400 })
    }

    console.log("Card type detected:", cardType)

    // Payment Gateway Integration
    // In production, this would integrate with:
    // - CMI (Centre Monétique Interbancaire) for Morocco
    // - Stripe for international payments
    // - PayPal as alternative
    
    // Mock payment processing for development
    // In production, replace with actual gateway API call
    const paymentResult = await processPaymentWithGateway({
      cardNumber,
      cardholderName: cardData.cardholderName,
      expiryDate: cardData.expiryDate,
      cvv: cardData.cvv,
      amount,
      cardType,
      orderId,
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || "Payment processing failed" },
        { status: 400 }
      )
    }

    console.log("Payment successful:", paymentResult.transactionId)

    // Update order status to PENDING if orderId is provided
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PENDING",
        },
      })
    }

    return NextResponse.json({
      success: true,
      transactionId: paymentResult.transactionId,
      cardType,
      amount,
    })

  } catch (error) {
    console.error("Error processing card payment:", error)
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }
}

// Mock payment gateway integration
// In production, replace with actual CMI/Stripe API calls
async function processPaymentWithGateway(data: {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
  amount: number
  cardType: string
  orderId?: string
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock payment validation
    // In production, this would be actual gateway validation
    const isValid = validateCardData(data)

    if (!isValid) {
      return { success: false, error: "Card validation failed" }
    }

    // Generate mock transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    console.log("Mock payment processed:", {
      transactionId,
      cardType: data.cardType,
      amount: data.amount,
      cardholderName: data.cardholderName,
    })

    return { success: true, transactionId }

  } catch (error) {
    console.error("Payment gateway error:", error)
    return { success: false, error: "Gateway processing failed" }
  }
}

// Mock card validation
// In production, this would be handled by the payment gateway
function validateCardData(data: {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
}): boolean {
  // Basic validation
  if (!data.cardNumber || data.cardNumber.length < 16) return false
  if (!data.cardholderName || data.cardholderName.length < 2) return false
  if (!data.expiryDate || data.expiryDate.length < 5) return false
  if (!data.cvv || data.cvv.length < 3) return false

  // Validate expiry date format (MM/YY)
  const expiryMatch = data.expiryDate.match(/^(\d{2})\/(\d{2})$/)
  if (!expiryMatch) return false

  const month = parseInt(expiryMatch[1])
  const year = parseInt("20" + expiryMatch[2])

  if (month < 1 || month > 12) return false

  // Check if card is expired
  const now = new Date()
  const expiryDate = new Date(year, month - 1)
  if (expiryDate < now) return false

  return true
}

// GET endpoint to retrieve payment gateway configuration
export async function GET() {
  return NextResponse.json({
    gateway: "XXX",
    supportedCardTypes: ["VISA", "MASTERCARD", "CMI", "AMERICAN_EXPRESS"],
    acquiringBank: {
      name: "XXX Bank",
      rib: "XXX XXX XXXXXXXXXXXXXXXXX XXX",
      swift: "XXXXXXXXXXX",
    },
    paymentProcessor: "XXX Payment Processor",
    cardNetworks: ["VISA", "MASTERCARD", "AMEX", "CMI"],
    currency: "MAD",
    environment: process.env.NODE_ENV || "development",
  })
}
