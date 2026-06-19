import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

// PUT /api/admin/team/[id] - Update commercial user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive } = body

    // Find the commercial
    const commercial = await prisma.commercial.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!commercial) {
      return NextResponse.json({ error: "Commercial not found" }, { status: 404 })
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: commercial.userId },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      commercial: {
        id: commercial.id,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          isActive: updatedUser.isActive,
        },
        department: commercial.department,
        employeeId: commercial.employeeId,
      },
    })
  } catch (error) {
    console.error("Error updating commercial:", error)
    return NextResponse.json({ error: "Failed to update commercial" }, { status: 500 })
  }
}

// DELETE /api/admin/team/[id] - Delete commercial user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the commercial
    const commercial = await prisma.commercial.findUnique({
      where: { id: params.id },
    })

    if (!commercial) {
      return NextResponse.json({ error: "Commercial not found" }, { status: 404 })
    }

    // Delete commercial (cascade will delete user if configured)
    await prisma.commercial.delete({
      where: { id: params.id },
    })

    // Also delete the user
    await prisma.user.delete({
      where: { id: commercial.userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting commercial:", error)
    return NextResponse.json({ error: "Failed to delete commercial" }, { status: 500 })
  }
}
