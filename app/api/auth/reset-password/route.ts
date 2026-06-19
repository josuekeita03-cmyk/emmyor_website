import { NextRequest, NextResponse } from "next/server"
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { passwordResetSchema } from "@/lib/validations/auth"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = passwordResetSchema.parse(body)
    
    // Verify token
    const userId = await verifyPasswordResetToken(validatedData.token)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      )
    }
    
    // Hash new password
    const hashedPassword = await hash(validatedData.password, 12)
    
    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
    
    // Delete the used token
    await deletePasswordResetToken(userId)
    
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
