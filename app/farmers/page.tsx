import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2 } from "lucide-react"
import { FarmerRegistrationForm } from "@/components/farmer-registration-form"

export default function FarmersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join as a Farmer</h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                At EMMYOR, we believe in empowering small-scale farmers by providing direct access to global markets.
                Let us help you grow your business while ensuring fair trade practices and sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Benefits for Farmers</h2>
              <ul className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
              <div className="grid gap-4">
                {steps.map((step, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                          {index + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tighter">Register Your Farm</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Fill out the form below to start listing your raw materials on the EMMYOR platform
              </p>
            </div>
            <FarmerRegistrationForm />
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tighter">Raw Materials Price Guide</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Current suggested price ranges for common agricultural products in Morocco
              </p>
            </div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price Range (per kg/liter)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell className="text-right">${product.priceRange}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              *Prices are estimates and may vary based on market conditions, quality, and seasonality
            </p>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">Need Help?</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Our support team is here to assist you with any questions
            </p>
            <div className="space-y-2">
              <p>Email: support@emmyor.com</p>
              <p>Phone: +212 123 456 789</p>
              <p>Live Chat: Available during business hours</p>
            </div>
            <Button size="lg" className="mt-4">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const benefits = [
  {
    title: "Direct Market Access",
    description: "Connect with buyers without intermediaries and maximize your profits",
  },
  {
    title: "Fair Pricing",
    description: "Get competitive prices for your products with transparent pricing structures",
  },
  {
    title: "Complete Traceability",
    description: "Track your products from farm to shelf with our advanced system",
  },
  {
    title: "Certification Support",
    description: "Receive assistance with obtaining necessary certifications",
  },
]

const steps = [
  {
    title: "Register Your Farm",
    description: "Sign up on our platform and provide details about your farm and produce",
  },
  {
    title: "List Raw Materials",
    description: "Add your products with details about quantity, quality, and pricing",
  },
  {
    title: "Receive Offers",
    description: "Get offers from buyers or let EMMYOR process your materials",
  },
  {
    title: "Track Progress",
    description: "Monitor your products' journey using our trackability system",
  },
]

const products = [
  {
    name: "Peanuts",
    description: "Raw peanuts with hulls",
    priceRange: "1.50 - 2.00",
  },
  {
    name: "Almonds",
    description: "Raw almonds",
    priceRange: "6.00 - 8.00",
  },
  {
    name: "Argan Oil",
    description: "Unrefined argan oil",
    priceRange: "20.00 - 30.00",
  },
  {
    name: "Saffron",
    description: "High-quality saffron threads",
    priceRange: "800.00 - 1,200.00",
  },
  {
    name: "Olives",
    description: "Fresh olives for oil production",
    priceRange: "0.80 - 1.20",
  },
  {
    name: "Olive Oil",
    description: "Virgin olive oil",
    priceRange: "5.00 - 7.00",
  },
]
