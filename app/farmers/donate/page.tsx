import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, HandHeart, MapPin } from "lucide-react"
import Image from "next/image"

export default function DonatePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Heart className="h-6 w-6 fill-current" />
                <span className="text-lg font-medium">Support Our Mission</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Support the Heart of Our Mission
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  At EMMYOR, we believe in empowering small-scale farmers who work tirelessly to bring us high-quality,
                  natural products. Show your appreciation by donating directly to the farmers who supply our raw
                  materials.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="inline-flex items-center">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Donate Now
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl lg:aspect-square">
              <Image
                alt="Farmers working in field"
                className="object-cover w-full h-full"
                height={600}
                src="/placeholder.svg"
                width={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Donations</CardTitle>
                <CardDescription>Amount raised so far</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">$125,480</div>
                <Progress value={65} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Farmers Supported</CardTitle>
                <CardDescription>Number of beneficiaries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">234</div>
                <Progress value={78} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Communities Impacted</CardTitle>
                <CardDescription>Regions benefiting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">45</div>
                <Progress value={90} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Farmers Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Our Farmers</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our farmers are the backbone of EMMYOR. They cultivate the finest raw materials with care and
                dedication.
              </p>
            </div>
          </div>
          <Tabs defaultValue="peanuts" className="mt-8">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="peanuts">Peanuts</TabsTrigger>
              <TabsTrigger value="almonds">Almonds</TabsTrigger>
              <TabsTrigger value="argan">Argan Oil</TabsTrigger>
              <TabsTrigger value="saffron">Saffron</TabsTrigger>
            </TabsList>
            <TabsContent value="peanuts" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {farmers.map((farmer) => (
                  <FarmerCard key={farmer.id} farmer={farmer} />
                ))}
              </div>
            </TabsContent>
            {/* Add similar TabsContent for other categories */}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Make a Difference Today</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Your contribution helps empower rural communities and ensures fair trade practices.
              </p>
            </div>
            <Button size="lg" className="inline-flex items-center">
              <HandHeart className="mr-2 h-5 w-5" />
              Start Donating
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FarmerCard({ farmer }: { farmer: Farmer }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-square relative mb-2">
          <Image src={farmer.image || "/placeholder.svg"} alt={farmer.name} fill className="rounded-lg object-cover" />
        </div>
        <CardTitle>{farmer.name}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {farmer.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{farmer.bio}</p>
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Experience:</span> {farmer.experience} years
          </div>
          <div className="text-sm">
            <span className="font-semibold">Products:</span> {farmer.products.join(", ")}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <HandHeart className="mr-2 h-4 w-4" />
          Donate to {farmer.name.split(" ")[0]}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface Farmer {
  id: string
  name: string
  location: string
  bio: string
  experience: number
  products: string[]
  image: string
}

const farmers: Farmer[] = [
  {
    id: "1",
    name: "Ahmed Benali",
    location: "Samassa Region",
    bio: "Ahmed has been growing peanuts for over 20 years using traditional methods combined with modern techniques.",
    experience: 20,
    products: ["Peanuts", "Almonds"],
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Fatima El Amrani",
    location: "Agadir",
    bio: "Fatima is a third-generation peanut farmer known for her commitment to organic practices.",
    experience: 15,
    products: ["Peanuts"],
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Karim Tazi",
    location: "Taroudant",
    bio: "Karim's farm has been certified organic for over a decade, producing premium quality peanuts.",
    experience: 25,
    products: ["Peanuts", "Dates"],
    image: "/placeholder.svg",
  },
]
