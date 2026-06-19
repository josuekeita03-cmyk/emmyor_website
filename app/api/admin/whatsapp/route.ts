import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/admin/whatsapp - Get WhatsApp settings (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get WhatsApp settings from database or use defaults
    let settings = await prisma.settings.findUnique({
      where: { key: "whatsapp_config" }
    })

    if (!settings) {
      // Return default settings
      return NextResponse.json({
        phoneNumber: "+212656271147",
        isActive: true,
        messageTemplate: `New EMMYOR Order #ORD-{orderId}
Customer: {customerName} | Tel: {customerPhone}
Delivery: {customerAddress}

Items ordered:
{items}

TOTAL: {total} DH
Note: {customerNote}`
      })
    }

    return NextResponse.json(JSON.parse(settings.value))
  } catch (error) {
    console.error("Error fetching WhatsApp settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp settings" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/whatsapp - Update WhatsApp settings (ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { phoneNumber, isActive, messageTemplate } = body

    // Validate phone number format (international format like +212XXXXXXXXX)
    if (phoneNumber && !/^\+\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use international format: +212XXXXXXXXX" },
        { status: 400 }
      )
    }

    // Upsert settings
    const settings = await prisma.settings.upsert({
      where: { key: "whatsapp_config" },
      update: {
        value: JSON.stringify({ phoneNumber, isActive, messageTemplate }),
        updatedAt: new Date(),
        description: "WhatsApp configuration for order notifications"
      },
      create: {
        key: "whatsapp_config",
        value: JSON.stringify({ phoneNumber, isActive, messageTemplate }),
        description: "WhatsApp configuration for order notifications"
      }
    })

    return NextResponse.json({ 
      success: true,
      settings: JSON.parse(settings.value)
    })
  } catch (error) {
    console.error("Error updating WhatsApp settings:", error)
    return NextResponse.json(
      { error: "Failed to update WhatsApp settings" },
      { status: 500 }
    )
  }
}

// POST /api/admin/whatsapp/test - Test WhatsApp message (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { phoneNumber, message } = body

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "Missing required fields: phoneNumber, message" },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!/^\+\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    // Generate WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace("+", "")}?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: "Test message generated. Open the URL to send the test message."
    })
  } catch (error) {
    console.error("Error testing WhatsApp message:", error)
    return NextResponse.json(
      { error: "Failed to test WhatsApp message" },
      { status: 500 }
    )
  }
}
