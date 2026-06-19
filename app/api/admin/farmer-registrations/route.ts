import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { sendFarmerApprovalEmail } from "@/lib/email"

const resend = new Resend(process.env.RESEND_API_KEY)

// GET /api/admin/farmer-registrations - Get all pending farmer registrations (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const registrations = await prisma.farmerRegistration.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ registrations })
  } catch (error) {
    console.error("Error fetching farmer registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch farmer registrations" },
      { status: 500 }
    )
  }
}

// POST /api/admin/farmer-registrations - Approve or reject farmer registration (ADMIN only)
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
    const { registrationId, action, password } = body

    if (!registrationId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Provide registrationId and action (approve/reject)" },
        { status: 400 }
      )
    }

    const registration = await prisma.farmerRegistration.findUnique({
      where: { id: registrationId }
    })

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.status !== "PENDING") {
      return NextResponse.json(
        { error: "Registration has already been processed" },
        { status: 400 }
      )
    }

    if (action === "reject") {
      // Parse the additional data stored in certifications field
      let additionalData: any = {}
      try {
        if (registration.certifications) {
          const parsed = JSON.parse(registration.certifications)
          additionalData = parsed
        }
      } catch (e) {
        console.log("Could not parse certifications field, using as-is")
      }

      // Reject the registration
      await prisma.farmerRegistration.update({
        where: { id: registrationId },
        data: { status: "REJECTED" }
      })

      // Send rejection email to the farmer
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: registration.userId || "",
          subject: "Registration Status Update - EMMYOR",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Registration Status Update</h2>
              <p>Dear ${registration.farmName},</p>
              <p>We regret to inform you that your ${additionalData.registrationType === "COOPERATIVE" ? "cooperative" : "farmer"} registration application has been <strong>REJECTED</strong>.</p>
              <p>If you believe this is an error or would like to appeal this decision, please contact us at support@emmyor.com.</p>
              <p>We appreciate your interest in joining EMMYOR and encourage you to apply again in the future.</p>
              <p>Best regards,<br>EMMYOR Team</p>
            </div>
          `
        })
        console.log("Rejection email sent successfully")
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError)
        // Continue even if email fails
      }

      return NextResponse.json({ 
        success: true,
        message: "Farmer registration rejected"
      })
    }

    if (action === "approve") {
      // Parse the additional data stored in certifications field
      let additionalData: any = {}
      try {
        if (registration.certifications) {
          const parsed = JSON.parse(registration.certifications)
          additionalData = parsed
        }
      } catch (e) {
        console.log("Could not parse certifications field, using as-is")
      }

      // Extract stored password or use provided password
      const storedPassword = additionalData.password || password || ""
      
      if (!storedPassword) {
        return NextResponse.json(
          { error: "Password is required to create user account" },
          { status: 400 }
        )
      }

      // Check if user already exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: registration.userId || "" }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }

      // Use the stored hashed password if available, otherwise hash the provided password
      const hashedPassword = additionalData.password ? additionalData.password : await bcrypt.hash(storedPassword, 10)

      // Determine role based on registration type
      const registrationType = additionalData.registrationType || "FARMER"
      const userRole = registrationType === "COOPERATIVE" ? "COOPERATIVE" : "FARMER"

      // Create user account with all fields
      const user = await prisma.user.create({
        data: {
          email: registration.userId || "",
          password: hashedPassword,
          fullName: additionalData.fullName || registration.farmName || "",
          role: userRole,
          isActive: true,
          city: registration.location || "",
          phoneNumber: additionalData.phone || "+212000000000",
        }
      })

      // Create farmer/cooperative profile with all fields
      const profileData: any = {
        userId: user.id,
        farmLocation: registration.location,
      }

      // Add experience for farmers
      if (registrationType === "FARMER" && additionalData.experience) {
        profileData.experience = additionalData.experience
      }

      // Add certifications if available
      if (additionalData.certifications) {
        profileData.certifications = additionalData.certifications
      }

      let farmer
      if (registrationType === "COOPERATIVE") {
        // Create cooperative profile
        farmer = await prisma.cooperative.create({
          data: profileData
        })
      } else {
        // Create farmer profile
        farmer = await prisma.farmer.create({
          data: profileData
        })
      }

      // Update registration with actual userId and APPROVED status
      await prisma.farmerRegistration.update({
        where: { id: registrationId },
        data: { 
          userId: user.id,
          status: "APPROVED"
        }
      })

      // Send approval email to the farmer with dashboard guide
      try {
        await sendFarmerApprovalEmail(
          user.email,
          user.fullName,
          "en" // Default to English, can be enhanced to detect from request
        )
        console.log("Approval email sent successfully")
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError)
        // Continue even if email fails
      }

      return NextResponse.json({ 
        success: true,
        message: `${registrationType === "COOPERATIVE" ? "Cooperative" : "Farmer"} registration approved. User account created.`,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        }
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing farmer registration:", error)
    return NextResponse.json(
      { error: "Failed to process farmer registration" },
      { status: 500 }
    )
  }
}
