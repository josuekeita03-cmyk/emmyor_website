import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/whatsapp/settings - Get WhatsApp settings
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.whatsappSettings.findFirst({
      where: { isActive: true },
    })

    if (!settings) {
      return NextResponse.json({
        phoneNumber: "",
        messageTemplate: "New Order:\n\nOrder ID: {orderId}\nCustomer: {customerName}\nEmail: {customerEmail}\nPhone: {customerPhone}\n\nItems:\n{items}\n\nTotal: {total} MAD",
        isActive: false,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching WhatsApp settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp settings" },
      { status: 500 }
    )
  }
}

// PUT /api/whatsapp/settings - Update WhatsApp settings (ADMIN only)
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
    const { phoneNumber, messageTemplate, isActive } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      )
    }

    const existingSettings = await prisma.whatsappSettings.findFirst()

    let settings

    if (existingSettings) {
      settings = await prisma.whatsappSettings.update({
        where: { id: existingSettings.id },
        data: {
          phoneNumber,
          messageTemplate: messageTemplate || existingSettings.messageTemplate,
          isActive: isActive !== undefined ? isActive : existingSettings.isActive,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        },
      })
    } else {
      settings = await prisma.whatsappSettings.create({
        data: {
          phoneNumber,
          messageTemplate: messageTemplate || "New Order:\n\nOrder ID: {orderId}\nCustomer: {customerName}\nEmail: {customerEmail}\nPhone: {customerPhone}\n\nItems:\n{items}\n\nTotal: {total} MAD",
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date(),
          updatedBy: session.user.id,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating WhatsApp settings:", error)
    return NextResponse.json(
      { error: "Failed to update WhatsApp settings" },
      { status: 500 }
    )
  }
}
