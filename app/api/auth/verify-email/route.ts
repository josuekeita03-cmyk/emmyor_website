import { NextRequest, NextResponse } from "next/server"
import { verifyEmailToken } from "@/lib/email"
import { emailVerificationSchema } from "@/lib/validations/auth"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = emailVerificationSchema.parse(body)
    
    // Verify token
    const isValid = await verifyEmailToken(validatedData.token)
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
