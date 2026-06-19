import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// PUT /api/b2b/consultations/:id - Update consultation status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "COMMERCIAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const consultation = await prisma.b2BConsultation.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({ success: true, consultation })
  } catch (error) {
    console.error("Error updating B2B consultation:", error)
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 })
  }
}
