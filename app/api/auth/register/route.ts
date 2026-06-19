import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registrationSchema } from "@/lib/validations/auth"
import { z } from "zod"
import { sendUserRegistrationEmail, createEmailVerificationToken } from "@/lib/email"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - prevent abuse
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000) // 3 registrations per hour
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 })
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = registrationSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)
    
    // Create user and role-specific profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          fullName: validatedData.fullName,
          phoneNumber: validatedData.phoneNumber,
          city: validatedData.city,
          role: validatedData.role,
          isActive: true,
        }
      })
      
      // Create role-specific profile based on role
      switch (validatedData.role) {
        case "CUSTOMER":
          await tx.customer.create({
            data: { userId: user.id }
          })
          break
          
        case "FARMER":
          await tx.farmer.create({
            data: {
              userId: user.id,
              farmLocation: (validatedData as any).farmLocation,
              experience: (validatedData as any).experience,
              certifications: (validatedData as any).certifications,
            }
          })
          break
          
        case "COOPERATIVE":
          await tx.cooperative.create({
            data: {
              userId: user.id,
              members: (validatedData as any).members,
              location: (validatedData as any).location,
              certifications: (validatedData as any).certifications,
            }
          })
          break
          
        case "COMPANY":
          await tx.company.create({
            data: {
              userId: user.id,
              companyName: (validatedData as any).companyName,
              industry: (validatedData as any).industry,
              size: (validatedData as any).size,
            }
          })
          break
          
        case "INDIVIDUAL_PRODUCER":
          await tx.individualProducer.create({
            data: {
              userId: user.id,
              brandName: (validatedData as any).brandName,
            }
          })
          break
          
        case "RETAILER":
          await tx.retailer.create({
            data: {
              userId: user.id,
              storeName: (validatedData as any).storeName,
              location: (validatedData as any).location,
            }
          })
          break
          
        case "COMMERCIAL":
          await tx.commercial.create({
            data: {
              userId: user.id,
              department: (validatedData as any).department,
              employeeId: (validatedData as any).employeeId,
            }
          })
          break
          
        default:
          // Default to customer if role is not recognized
          await tx.customer.create({
            data: { userId: user.id }
          })
      }
      
      return user
    })
    
    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = result
    
    // Send welcome email with verification link
    const verificationToken = await createEmailVerificationToken(result.id)
    const locale = "en" // Default to English, can be enhanced to detect from request
    await sendUserRegistrationEmail(
      result.email,
      result.fullName,
      verificationToken,
      locale
    )
    
    return NextResponse.json(
      { 
        message: "Registration successful. Please check your email to verify your account.",
        user: userWithoutPassword 
      },
      { status: 201 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
