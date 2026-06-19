import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function CustomerOrdersPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container py-10">
      <DashboardHeader
        title="My Orders"
        description="View all your order history"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ORD001</TableCell>
                <TableCell>Raw Almonds (1kg)</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                    Delivered
                  </span>
                </TableCell>
                <TableCell>95 DH</TableCell>
                <TableCell>2024-01-15</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ORD002</TableCell>
                <TableCell>Argan Oil (500ml)</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
                    Processing
                  </span>
                </TableCell>
                <TableCell>275 DH</TableCell>
                <TableCell>2024-02-20</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ORD003</TableCell>
                <TableCell>Saffron (10g)</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                    Shipped
                  </span>
                </TableCell>
                <TableCell>400 DH</TableCell>
                <TableCell>2024-02-25</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Link href={`/${locale}/dashboard/customer`} className="inline-flex items-center mt-4 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
