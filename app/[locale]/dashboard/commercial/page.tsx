"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileText, TrendingUp, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function CommercialDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [offers, setOffers] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommercialData()
  }, [])

  const fetchCommercialData = async () => {
    try {
      // Fetch pending offers (would need API endpoint)
      // const offersRes = await fetch("/api/commercial/offers")
      // const offersData = await offersRes.json()
      // setOffers(offersData.offers || [])

      // Fetch support tickets (would need API endpoint)
      // const ticketsRes = await fetch("/api/commercial/support")
      // const ticketsData = await ticketsRes.json()
      // setTickets(ticketsData.tickets || [])

      // Fetch products for catalog moderation
      const productsRes = await fetch("/api/products")
      const productsData = await productsRes.json()
      setProducts(productsData.products || [])
    } catch (error) {
      console.error("Error fetching commercial data:", error)
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
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Commercial"}`}
        description="Offer management, support, and moderation"
        notifications={offers.length + tickets.length}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Offers"
          value={offers.length.toString()}
          description="Pending review"
          icon={FileText}
        />
        <StatsCard title="Support Tickets" value={tickets.length.toString()} description="Open tickets" icon={MessageSquare} />
        <StatsCard title="Products" value={products.length.toString()} description="In catalog" icon={Users} />
        <StatsCard
          title="Platform Activity"
          value="100%"
          description="Uptime this month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Offer Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending offers</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.farmer}</TableCell>
                      <TableCell>{offer.product}</TableCell>
                      <TableCell>{offer.amount} DH</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">Approve</Button>
                          <Button size="sm" variant="destructive">Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/commercial/offers`}>
                View all offers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No support tickets</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.user}</TableCell>
                      <TableCell>{ticket.issue}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          ticket.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {ticket.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          ticket.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {ticket.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/commercial/support`}>
                View all tickets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Catalog Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products in catalog</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price} DH</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">
                          {product.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="link" className="mt-4" asChild>
            <Link href={`/${locale}/dashboard/admin/products`}>
              Manage all products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
