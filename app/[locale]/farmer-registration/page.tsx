import { FarmerRegistrationForm } from "@/components/farmer-registration-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerRegistrationPage({ params }: { params: { locale: Locale } }) {
  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join EMMYOR as a Farmer</h1>
          <p className="text-muted-foreground">
            Register your farm and start selling your products to customers across Morocco
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Farmer Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <FarmerRegistrationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
