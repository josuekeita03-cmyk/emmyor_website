import { NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/email"
import { passwordResetRequestSchema } from "@/lib/validations/auth"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = passwordResetRequestSchema.parse(body)
    
    // Create password reset token
    const token = await createPasswordResetToken(validatedData.email)
    
    if (!token) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If the email exists, a password reset link has been sent" },
        { status: 200 }
      )
    }
    
    // Send password reset email
    await sendPasswordResetEmail(validatedData.email, token)
    
    return NextResponse.json(
      { 
        message: process.env.RESEND_API_KEY 
          ? "If the email exists, a password reset link has been sent" 
          : "Password reset link generated (email service not configured - check console)" 
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
    
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
