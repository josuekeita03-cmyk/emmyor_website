import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendCommercialOnboardingEmail } from "@/lib/email"

// GET /api/admin/team - Fetch all commercial users
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commercials = await prisma.commercial.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
    })

    return NextResponse.json({ commercials })
  } catch (error) {
    console.error("Error fetching commercials:", error)
    return NextResponse.json({ error: "Failed to fetch commercials" }, { status: 500 })
  }
}

// POST /api/admin/team - Create new commercial user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, email, department } = body

    // Validate input
    if (!fullName || !email || !department) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Generate random password
    const password = crypto.randomBytes(12).toString('hex')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate employee ID
    const employeeId = `EMP-${Date.now().toString().slice(-6)}`

    // Create user with COMMERCIAL role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: "COMMERCIAL",
        isActive: true,
      },
    })

    // Create commercial profile
    const commercial = await prisma.commercial.create({
      data: {
        userId: user.id,
        department,
        employeeId,
      },
    })

    // TODO: Send email with credentials
    // For now, return the password in the response (remove this in production)
    console.log(`Commercial created - Email: ${email}, Password: ${password}, Employee ID: ${employeeId}`)

    // Send onboarding email
    await sendCommercialOnboardingEmail(email, fullName, password, employeeId, department)

    return NextResponse.json({
      success: true,
      commercial: {
        id: commercial.id,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          isActive: user.isActive,
        },
        department: commercial.department,
        employeeId: commercial.employeeId,
      },
    })
  } catch (error) {
    console.error("Error creating commercial:", error)
    return NextResponse.json({ error: "Failed to create commercial" }, { status: 500 })
  }
}
