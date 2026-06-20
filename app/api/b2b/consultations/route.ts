import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { sendB2BConsultationReceivedEmail } from "@/lib/email"
import { authOptions } from "@/lib/auth"

// Validation schema for B2B consultation
const consultationSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  serviceType: z.enum(["Packaging", "ONSSA Certification", "Automation", "Machinery", "Other"]),
  budget: z.string().optional(),
  message: z.string().optional(),
})

// POST /api/b2b/consultations - Create a new B2B consultation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = consultationSchema.parse(body)

    let companyId: string | null = null

    // If user is logged in as COMPANY, link to their company record
    if (session?.user?.role === "COMPANY") {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id }
      })
      if (company) {
        companyId = company.id
      }
    }

    // Create consultation record
    const consultation = await prisma.b2BConsultation.create({
      data: {
        companyName: validatedData.companyName,
        contactName: validatedData.contactName,
        email: validatedData.email,
        phone: validatedData.phone,
        serviceType: validatedData.serviceType,
        budget: validatedData.budget ? parseFloat(validatedData.budget) : null,
        message: validatedData.message,
        status: "PENDING",
        companyId,
      },
    })

    // Send notification email to B2B team (don't block on email failure)
    try {
      await sendB2BConsultationReceivedEmail(
        validatedData.companyName,
        validatedData.contactName,
        validatedData.email,
        validatedData.phone,
        validatedData.serviceType,
        validatedData.budget || "Not specified",
        validatedData.message
      )
    } catch (emailError) {
      console.error("Failed to send B2B consultation email:", emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      consultation: {
        id: consultation.id,
        companyName: consultation.companyName,
        contactName: consultation.contactName,
        serviceType: consultation.serviceType,
        status: consultation.status,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating B2B consultation:", error)
    return NextResponse.json({ error: "Failed to create consultation" }, { status: 500 })
  }
}

// GET /api/b2b/consultations - Get all consultations (admin/commercial only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("B2B consultations GET request - Session:", session?.user?.role, session?.user?.id)
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "COMMERCIAL")) {
      console.log("B2B consultations - Unauthorized, role:", session?.user?.role)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const serviceType = searchParams.get("serviceType")

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (serviceType) where.serviceType = serviceType

    console.log("B2B consultations - Fetching with where:", where)

    const consultations = await prisma.b2BConsultation.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
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
      },
    })

    console.log("B2B consultations - Found:", consultations.length, "consultations")

    return NextResponse.json({ consultations })
  } catch (error) {
    console.error("Error fetching B2B consultations:", error)
    return NextResponse.json({ error: "Failed to fetch consultations" }, { status: 500 })
  }
}
