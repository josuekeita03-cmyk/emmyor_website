import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations/auth"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Apply rate limiting: 5 attempts per 15 minutes
    const rateLimitResult = rateLimit(ip, 5, 15 * 60 * 1000)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        customer: true,
        farmer: true,
        cooperative: true,
        company: true,
        individualProducer: true,
        retailer: true,
        commercial: true,
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      )
    }
    
    // Return user data (password is excluded by default in response)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(
      { 
        message: "Login successful",
        user: userWithoutPassword,
        remainingAttempts: rateLimitResult.remaining
      },
      { status: 200 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
