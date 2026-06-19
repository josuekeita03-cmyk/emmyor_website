import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, TrendingUp, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function IndividualProducerDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container py-10">
      <DashboardHeader
        title="Producer Dashboard"
        description="Manage your finished products and packaging"
        notifications={1}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Products"
          value="8"
          description="Finished goods"
          icon={Package}
          trend={{ value: 3, label: "from last month" }}
        />
        <StatsCard title="Pending Orders" value="4" description="Awaiting shipment" icon={Package} />
        <StatsCard title="Stock Level" value="2,500 units" description="Total inventory" icon={Package} trend={{ value: 5, label: "from last month" }} />
        <StatsCard
          title="Monthly Revenue"
          value="18,750 DH"
          description="This month"
          icon={TrendingUp}
          trend={{ value: 10, label: "vs last month" }}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Product Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Argan Oil (500ml)</TableCell>
                <TableCell>Oils</TableCell>
                <TableCell>150 units</TableCell>
                <TableCell>275 DH</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Peanut Butter</TableCell>
                <TableCell>Spreads</TableCell>
                <TableCell>200 units</TableCell>
                <TableCell>60 DH</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Button variant="link" className="mt-4" asChild>
            <Link href={`/${locale}/dashboard/individual-producer/products`}>
              View all products
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
              <Link href={`/${locale}/dashboard/individual-producer/add-product`}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/individual-producer/orders`}>View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/individual-producer/analytics`}>View Analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
