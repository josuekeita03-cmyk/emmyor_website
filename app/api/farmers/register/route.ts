import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Resend } from "resend"
import { sendFarmerRegistrationNotification } from "@/lib/email"

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/farmers/register - Register a new farmer (public registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Received registration request:", body)
    
    const { 
      registrationType, 
      fullName, 
      email, 
      phone, 
      password, 
      farmLocation, 
      experience, 
      certifications, 
      members, 
      produceType, 
      quantity, 
      price, 
      additionalInfo 
    } = body

    // Validate required fields
    if (!registrationType || !fullName || !email || !phone || !password || !farmLocation || !produceType || !quantity || !price) {
      console.log("Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: registrationType, fullName, email, phone, password, farmLocation, produceType, quantity, price" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format")
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate phone format (international format like +212...)
    const phoneRegex = /^\+\d{10,15}$/
    if (!phoneRegex.test(phone)) {
      console.log("Invalid phone format")
      return NextResponse.json(
        { error: "Invalid phone format. Use international format: +212XXXXXXXXX" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short")
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if email already exists in users
    console.log("Checking if email exists in users...")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("Email already registered")
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Check if there's already a pending registration with this email
    console.log("Checking for existing pending registration...")
    const existingRegistration = await prisma.farmerRegistration.findFirst({
      where: { 
        userId: email, // Using email as temporary userId for pending registrations
        status: "PENDING"
      }
    })

    if (existingRegistration) {
      console.log("Pending registration already exists")
      return NextResponse.json(
        { error: "You already have a pending registration. Please wait for approval." },
        { status: 400 }
      )
    }

    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("Creating farmer registration...")
    // Create farmer registration with PENDING status (no user account yet)
    const registration = await prisma.farmerRegistration.create({
      data: {
        userId: email, // Using email as temporary identifier
        farmName: fullName,
        location: farmLocation,
        products: JSON.stringify([{ type: produceType, quantity, price }]),
        certifications: certifications || null,
        status: "PENDING"
      }
    })

    // Store additional data in a separate structure (we'll need to add these fields to the schema)
    // For now, we'll store them in the certifications field as JSON if needed
    const additionalData = {
      registrationType,
      fullName,
      phone,
      password: hashedPassword, // Store hashed password
      experience: experience || null,
      members: members || null,
      additionalInfo: additionalInfo || null
    }

    // Update registration with additional data (we'll need to add these fields to the schema)
    // For now, we'll store this in the certifications field as a JSON object
    await prisma.farmerRegistration.update({
      where: { id: registration.id },
      data: {
        certifications: JSON.stringify({
          certifications: certifications || null,
          ...additionalData
        })
      }
    })

    console.log("Registration created successfully:", registration)

    // Send receipt email to the farmer
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Farmer Registration Received - EMMYOR",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Registration Received</h2>
            <p>Dear ${fullName},</p>
            <p>Thank you for registering with EMMYOR. We have received your ${registrationType === "COOPERATIVE" ? "cooperative" : "farmer"} registration application.</p>
            <p><strong>Registration Details:</strong></p>
            <ul>
              <li>Registration Type: ${registrationType === "COOPERATIVE" ? "Cooperative" : "Individual Farmer"}</li>
              <li>Farm/Cooperative Name: ${fullName}</li>
              <li>Location: ${farmLocation}</li>
              <li>Main Produce: ${produceType}</li>
            </ul>
            <p>Your application is currently <strong>PENDING</strong> and will be reviewed by our team.</p>
            <p>You will receive another email once your registration has been approved or rejected.</p>
            <p>If you have any questions, please contact us at support@emmyor.com</p>
            <p>Best regards,<br>EMMYOR Team</p>
          </div>
        `
      })
      console.log("Receipt email sent successfully")
    } catch (emailError) {
      console.error("Failed to send receipt email:", emailError)
      // Continue even if email fails
    }

    // Send notification to admin team
    try {
      const products = [produceType]
      await sendFarmerRegistrationNotification(
        fullName,
        fullName, // Using fullName as farm name
        email,
        phone,
        farmLocation,
        products,
        certifications
      )
      console.log("Admin notification sent successfully")
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError)
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true,
      registration,
      message: "Farmer registration submitted successfully. Your application is pending approval. You will receive an email with further instructions once your account is approved."
    }, { status: 201 })
  } catch (error) {
    console.error("Error registering farmer:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: "Failed to register farmer", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
