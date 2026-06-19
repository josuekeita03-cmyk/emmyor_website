import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerOffersPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  const offers = [
    {
      id: 1,
      product: "Raw Peanuts",
      quantity: 500,
      pricePerUnit: 40,
      buyer: "Company ABC",
      status: "Pending",
    },
    {
      id: 2,
      product: "Almonds",
      quantity: 200,
      pricePerUnit: 95,
      buyer: "Retailer XYZ",
      status: "Pending",
    },
    {
      id: 3,
      product: "Argan Seeds",
      quantity: 1000,
      pricePerUnit: 25,
      buyer: "Cooperative DEF",
      status: "Accepted",
    },
  ]

  return (
    <div className="container py-10">
      <DashboardHeader
        title="Purchase Offers"
        description="Manage incoming purchase offers"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.product}</TableCell>
                  <TableCell>{offer.quantity} kg</TableCell>
                  <TableCell>{offer.pricePerUnit} DH</TableCell>
                  <TableCell>{offer.buyer}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        offer.status === "Accepted"
                          ? "bg-green-100 text-green-700"
                          : offer.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {offer.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
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
