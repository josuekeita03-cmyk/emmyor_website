import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerCertificationsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container py-10">
      <DashboardHeader
        title="Certifications"
        description="Request and manage your product certifications"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Request New Certification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Certification Type</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>Select certification type</option>
                <option>Organic Certification</option>
                <option>Quality Assurance</option>
                <option>Fair Trade</option>
                <option>Geographical Indication</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Product</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md">
                <option>Select product</option>
                <option>Raw Peanuts</option>
                <option>Almonds</option>
                <option>Argan Seeds</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Enter any additional information"
              />
            </div>
            <Button className="w-full">Submit Request</Button>
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
