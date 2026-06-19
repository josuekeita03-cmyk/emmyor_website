import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerListMaterialsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container py-10">
      <DashboardHeader
        title="List New Materials"
        description="Add new products to your inventory"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Add New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>Select category</option>
                <option>Nuts</option>
                <option>Oils</option>
                <option>Spices</option>
                <option>Seeds</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantity (kg)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price per Unit (DH)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Enter product description"
              />
            </div>
            <Button className="w-full">Create Listing</Button>
          </div>
        </CardContent>
      </Card>

      <Link href={`/${locale}/dashboard/farmer`} className="inline-flex items-center mt-4 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
