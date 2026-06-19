"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Package, TrendingUp, ArrowRight, Check, X } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function CooperativeDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [members, setMembers] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCooperativeData()
  }, [])

  const fetchCooperativeData = async () => {
    try {
      // Fetch members (would need API endpoint)
      // const membersRes = await fetch("/api/cooperative/members")
      // const membersData = await membersRes.json()
      // setMembers(membersData.members || [])

      // Fetch listings
      const listingsRes = await fetch("/api/products?cooperativeId=" + session?.user?.id)
      const listingsData = await listingsRes.json()
      setListings(listingsData.products || [])

      // Fetch shipments (would need API endpoint)
      // const shipmentsRes = await fetch("/api/cooperative/shipments")
      // const shipmentsData = await shipmentsRes.json()
      // setShipments(shipmentsData.shipments || [])
    } catch (error) {
      console.error("Error fetching cooperative data:", error)
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
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Cooperative"}`}
        description="Manage your cooperative members and collective operations"
        notifications={members.length}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Members"
          value={members.length.toString()}
          description="Registered farmers"
          icon={Users}
        />
        <StatsCard title="Collective Listings" value={listings.length.toString()} description="Products available" icon={Package} />
        <StatsCard title="Pending Orders" value={shipments.length.toString()} description="Awaiting processing" icon={Package} />
        <StatsCard
          title="Monthly Revenue"
          value="0 DH"
          description="This month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Member Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending member requests</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.location}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/cooperative/members`}>
                View all members
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collective Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active shipments</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">#{shipment.id}</TableCell>
                      <TableCell>{shipment.products}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                          {shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>{shipment.delivery}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/cooperative/shipments`}>
                View all shipments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
