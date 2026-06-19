"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, FileText, TrendingUp, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function CompanyDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [consultations, setConsultations] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    try {
      // Fetch consultations (would need API endpoint)
      // const consultationsRes = await fetch("/api/company/consultations")
      // const consultationsData = await consultationsRes.json()
      // setConsultations(consultationsData.consultations || [])

      // Fetch bulk orders (would need API endpoint)
      // const ordersRes = await fetch("/api/company/orders")
      // const ordersData = await ordersRes.json()
      // setOrders(ordersData.orders || [])
    } catch (error) {
      console.error("Error fetching company data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <DashboardHeader
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Company"}`}
        description="B2B consultations and bulk orders management"
        notifications={consultations.length}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Consultations"
          value={consultations.length.toString()}
          description="Pending requests"
          icon={FileText}
        />
        <StatsCard title="Bulk Orders" value={orders.length.toString()} description="This month" icon={Building2} />
        <StatsCard title="Total Volume" value="0 kg" description="Products ordered" icon={Package} />
        <StatsCard
          title="Monthly Spend"
          value="0 DH"
          description="This month"
          icon={TrendingUp}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent B2B Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active consultations</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell className="font-medium">{consultation.company}</TableCell>
                    <TableCell>{consultation.serviceType}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        consultation.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {consultation.status}
                      </span>
                    </TableCell>
                    <TableCell>{consultation.date}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="link" className="mt-4" asChild>
            <Link href={`/${locale}/dashboard/company/consultations`}>
              View all consultations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild>
              <Link href={`/${locale}/b2b`}>
                <FileText className="mr-2 h-4 w-4" />
                New Consultation
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/company/orders`}>View Bulk Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/company/analytics`}>View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
