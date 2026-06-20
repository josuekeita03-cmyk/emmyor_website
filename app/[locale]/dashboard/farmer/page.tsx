"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListPlus, ShoppingBag, TrendingUp, Truck, ArrowRight, Check, X, Package } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [shipments, setShipments] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasFarmerProfile, setHasFarmerProfile] = useState(false)

  useEffect(() => {
    fetchFarmerData()
  }, [])

  const fetchFarmerData = async () => {
    try {
      // Check if user has an approved farmer profile
      const farmerRes = await fetch("/api/farmers/profile")
      if (farmerRes.ok) {
        setHasFarmerProfile(true)
        
        // Fetch farmer's listings
        const listingsRes = await fetch("/api/farmers/listings")
        const listingsData = await listingsRes.json()
        setProducts(listingsData.products || [])

        // Fetch pending offers (orders with farmer's products that are pending)
        const offersRes = await fetch("/api/farmers/offers")
        const offersData = await offersRes.json()
        setOffers(offersData.offers || [])

        // Fetch active shipments (orders with farmer's products that are shipped/processing)
        const shipmentsRes = await fetch("/api/farmers/shipments")
        const shipmentsData = await shipmentsRes.json()
        setShipments(shipmentsData.shipments || [])

        // Calculate monthly revenue from orders
        const ordersRes = await fetch("/api/farmers/revenue")
        const revenueData = await ordersRes.json()
        setMonthlyRevenue(revenueData.monthlyRevenue || 0)
      } else {
        setHasFarmerProfile(false)
      }
    } catch (error) {
      console.error("Error fetching farmer data:", error)
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

  if (!hasFarmerProfile) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Farmer Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have an approved farmer profile yet. If you've submitted a registration, please wait for admin approval.
            </p>
            <Button asChild>
              <Link href={`/${locale}/farmer-registration`}>
                Submit Farmer Registration
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <DashboardHeader
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Farmer"}`}
        description="Manage your listings and track your business growth"
        notifications={offers.length}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Listings"
          value={products.length.toString()}
          description="Products available"
          icon={Package}
        />
        <StatsCard title="Pending Offers" value={offers.length.toString()} description="Awaiting response" icon={ShoppingBag} />
        <StatsCard title="Active Shipments" value={shipments.length.toString()} description="In transit" icon={Truck} />
        <StatsCard
          title="Monthly Revenue"
          value={`${monthlyRevenue.toFixed(0)} DH`}
          description="This month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Offers</CardTitle>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending offers</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.product}</TableCell>
                      <TableCell>{offer.quantity} kg</TableCell>
                      <TableCell>{offer.pricePerUnit} DH</TableCell>
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
              <Link href={`/${locale}/dashboard/farmer/offers`}>
                View all offers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {shipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active shipments</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">#{shipment.id}</TableCell>
                      <TableCell>{shipment.product}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            shipment.status === "In Transit"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>{shipment.deliveryDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/farmer/shipments`}>
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
