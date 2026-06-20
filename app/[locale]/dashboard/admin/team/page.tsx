import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Mail, Shield, UserCheck, UserX, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n-config"

export default async function AdminTeam({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="container py-10">
        <div className="text-center text-red-600">Unauthorized</div>
      </div>
    )
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard/admin`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <DashboardHeader
        title="Team Management"
        description="Manage EMMYOR commercial staff members"
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Commercial Staff ({commercials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commercials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No commercial staff found
                  </TableCell>
                </TableRow>
              ) : (
                commercials.map((commercial) => (
                  <TableRow key={commercial.id}>
                    <TableCell className="font-medium">{commercial.user.fullName}</TableCell>
                    <TableCell>{commercial.user.email}</TableCell>
                    <TableCell className="font-mono text-xs">{commercial.employeeId}</TableCell>
                    <TableCell>
                      <Badge variant={commercial.user.isActive ? "default" : "secondary"}>
                        {commercial.user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
