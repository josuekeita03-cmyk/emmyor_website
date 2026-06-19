import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerShipmentsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  const shipments = [
    {
      id: "SHP001",
      product: "Raw Peanuts",
      status: "In Transit",
      deliveryDate: "2024-03-01",
      destination: "Casablanca",
    },
    {
      id: "SHP002",
      product: "Almonds",
      status: "Processing",
      deliveryDate: "2024-03-05",
      destination: "Marrakech",
    },
    {
      id: "SHP003",
      product: "Argan Seeds",
      status: "Delivered",
      deliveryDate: "2024-02-28",
      destination: "Agadir",
    },
  ]

  return (
    <div className="container py-10">
      <DashboardHeader
        title="Active Shipments"
        description="Track your product shipments"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Destination</TableHead>
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
                          : shipment.status === "Processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {shipment.status}
                    </span>
                  </TableCell>
                  <TableCell>{shipment.deliveryDate}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Link href={`/${locale}/dashboard/farmer`} className="inline-flex items-center mt-4 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
