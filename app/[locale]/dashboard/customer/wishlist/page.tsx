import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Locale } from "@/lib/i18n-config"

export default function CustomerWishlistPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  const wishlistItems = [
    {
      id: 1,
      name: "Premium Peanut Butter",
      price: 60,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Organic Honey",
      price: 180,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Pure Argan Oil",
      price: 550,
      image: "/placeholder.svg",
    },
    {
      id: 4,
      name: "Raw Almonds (1kg)",
      price: 95,
      image: "/placeholder.svg",
    },
    {
      id: 5,
      name: "Saffron (10g)",
      price: 400,
      image: "/placeholder.svg",
    },
  ]

  return (
    <div className="container py-10">
      <DashboardHeader
        title="My Wishlist"
        description="Items you've saved for later"
        notifications={0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlistItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="relative h-48 w-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-lg font-bold">{item.price} DH</p>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1">Add to Cart</Button>
                <Button variant="outline">Remove</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link href={`/${locale}/dashboard/customer`} className="inline-flex items-center mt-4 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
