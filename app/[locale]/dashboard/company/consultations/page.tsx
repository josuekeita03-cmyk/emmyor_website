"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

interface Consultation {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  serviceType: string
  message?: string
  status: string
  createdAt: string
}

export default function CompanyConsultations({ params }: { params: { locale: Locale } }) {
  const { data: session } = useSession()
  const { locale } = params
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch("/api/b2b/consultations")
      const data = await response.json()
      setConsultations(data.consultations || [])
    } catch (error) {
      console.error("Error fetching consultations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading consultations...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <DashboardHeader
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Company"}`}
        description="Manage your B2B consultations"
        notifications={consultations.filter(c => c.status === "PENDING").length}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            B2B Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No consultations yet</p>
              <Button asChild>
                <Link href={`/${locale}/b2b`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Consultation
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell className="font-medium">{consultation.companyName}</TableCell>
                      <TableCell>
                        <div>
                          <p>{consultation.contactName}</p>
                          <p className="text-sm text-muted-foreground">{consultation.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{consultation.serviceType}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            consultation.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : consultation.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700"
                                : consultation.status === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {consultation.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(consultation.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="link" className="mt-4" asChild>
                <Link href={`/${locale}/b2b`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
