"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Store, Package, TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function RetailerDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [catalog, setCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRetailerData()
  }, [])

  const fetchRetailerData = async () => {
    try {
      // Fetch bulk orders (would need API endpoint)
      // const ordersRes = await fetch("/api/retailer/orders")
      // const ordersData = await ordersRes.json()
      // setOrders(ordersData.orders || [])

      // Fetch B2B catalog
      const catalogRes = await fetch("/api/products?category=Bulk Orders")
      const catalogData = await catalogRes.json()
      setCatalog(catalogData.products || [])
    } catch (error) {
      console.error("Error fetching retailer data:", error)
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
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Retailer"}`}
        description="Manage bulk orders and B2B catalog"
        notifications={orders.length}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bulk Orders"
          value={orders.length.toString()}
          description="Active orders"
          icon={Package}
        />
        <StatsCard title="Catalog Items" value={catalog.length.toString()} description="Products listed" icon={Store} />
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
          <CardTitle>Recent Bulk Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No bulk orders yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.products}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.total} DH</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="link" className="mt-4" asChild>
            <Link href={`/${locale}/dashboard/retailer/orders`}>
              View all orders
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
              <Link href={`/${locale}/dashboard/retailer/catalog`}>
                <Store className="mr-2 h-4 w-4" />
                Browse B2B Catalog
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/retailer/new-order`}>New Bulk Order</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/retailer/analytics`}>View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
