import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HandHeart, MapPin, Phone, Mail, Award, Leaf, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface PageProps {
  params: {
    sku: string
  }
}

export default function FarmersForProductPage({ params }: PageProps) {
  // This would normally fetch product and farmer data based on the SKU
  const product = mockProducts[params.sku] || mockProducts["raw-peanuts"]
  const farmers = mockFarmers.filter((farmer) => farmer.products.includes(product.name))

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Meet the Farmers Behind {product.name}
              </h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover the Heart of Our Products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-12">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter">Our Farmers Are Our Foundation</h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Our farmers are the backbone of EMMYOR. They cultivate high-quality raw materials with care and
                  dedication. Get to know the people behind your favorite products.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold">{farmers.length}</CardTitle>
                    <CardDescription>Active Farmers</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold">20+</CardTitle>
                    <CardDescription>Years Experience</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold">100%</CardTitle>
                    <CardDescription>Certified</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>About {product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span>Origin: {product.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>Quality: Premium Grade</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span>100% Natural</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/shop/products/${params.sku}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Shop {product.name}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Farmer Profiles */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {farmers.map((farmer) => (
              <Card key={farmer.id} className="flex flex-col">
                <CardHeader>
                  <div className="aspect-square relative mb-2">
                    <Image
                      src={farmer.image || "/placeholder.svg"}
                      alt={farmer.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {farmer.name}
                    <Badge variant="secondary" className="ml-2">
                      {farmer.experience} Years
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {farmer.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{farmer.bio}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {farmer.certifications.map((cert) => (
                          <Badge key={cert} variant="outline">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {farmer.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {farmer.email}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full">
                    <HandHeart className="mr-2 h-4 w-4" />
                    Donate to {farmer.name.split(" ")[0]}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Your Support Makes a Difference</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                By purchasing our products or donating directly to our farmers, you're helping to empower rural
                communities and promote sustainable agriculture.
              </p>
            </div>
            <div className="w-full max-w-3xl space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Donations</span>
                  <span>75,000 DH raised</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Farmers Supported</span>
                  <span>234 farmers</span>
                </div>
                <Progress value={85} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Communities Impacted</span>
                  <span>45 communities</span>
                </div>
                <Progress value={90} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Where Our Farmers Are Located</h2>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Our network of farmers spans across Morocco's most fertile regions
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {regions.map((region) => (
                <Card key={region}>
                  <CardHeader>
                    <CardTitle className="text-lg">{region}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Support Our Mission</h2>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">
                Help us create sustainable livelihoods for our farming communities
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/shop">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop More Products
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/farmers/donate">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Donate Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

interface Product {
  name: string
  description: string
  origin: string
}

const mockProducts: Record<string, Product> = {
  "raw-peanuts": {
    name: "Raw Peanuts",
    description:
      "Premium quality raw peanuts cultivated using traditional methods combined with modern sustainable practices.",
    origin: "Samassa Region",
  },
  "raw-almonds": {
    name: "Raw Almonds",
    description:
      "High-quality almonds grown in the fertile soils of the Atlas Mountains using sustainable farming practices.",
    origin: "Atlas Mountains",
  },
}

interface Farmer {
  id: string
  name: string
  location: string
  bio: string
  experience: number
  products: string[]
  certifications: string[]
  phone: string
  email: string
  image: string
}

const mockFarmers: Farmer[] = [
  {
    id: "1",
    name: "Ahmed El Khattabi",
    location: "Samassa Region",
    bio: "Ahmed has been growing peanuts for over 20 years using traditional methods combined with modern techniques. His farm spans 5 hectares and produces some of the finest peanuts in the region.",
    experience: 20,
    products: ["Raw Peanuts"],
    certifications: ["Organic Certified", "Fair Trade"],
    phone: "+212 123-456-789",
    email: "ahmed@emmyor.com",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Fatima Zaidi",
    location: "Atlas Mountains",
    bio: "Fatima is a third-generation almond farmer known for her commitment to sustainable practices. Her family-run farm produces premium-quality almonds that are exported globally.",
    experience: 15,
    products: ["Raw Almonds"],
    certifications: ["ISO 9001", "ONSSA Certified"],
    phone: "+212 987-654-321",
    email: "fatima@emmyor.com",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Mohammed Laaroussi",
    location: "Agadir Region",
    bio: "Mohammed is a young farmer passionate about organic farming. His innovative approaches to sustainable agriculture have made his farm a model for others in the region.",
    experience: 8,
    products: ["Raw Peanuts", "Raw Almonds"],
    certifications: ["Organic Certified", "ONSSA Certified"],
    phone: "+212 456-789-123",
    email: "mohammed@emmyor.com",
    image: "/placeholder.svg",
  },
]

const regions = [
  "Samassa Region",
  "Atlas Mountains",
  "Agadir Region",
  "Souss Region",
  "Taliouine Region",
  "Marrakech Region",
  "Fez Region",
  "Meknes Region",
]
