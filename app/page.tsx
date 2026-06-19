import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Package, ShoppingCart, Tractor, Users, Heart, HandHeart } from "lucide-react"
import Image from "next/image"
import { TrackProductForm } from "@/components/track-product-form"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Connecting Farmers to Global Markets
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Empowering farmers with direct market access while providing premium agricultural products and
                  innovative solutions.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href="/shop">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Shop Premium Products
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/farmers">
                    Join as a Farmer
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Link href="/b2b">Partner with Us (B2B)</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl w-full max-w-[600px]">
              <iframe
                src="https://www.youtube.com/embed/THhOzCjGvJY"
                title="EMMYOR promotional video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Key Features</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover how EMMYOR revolutionizes agricultural trade with innovative solutions
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Tractor className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Farmer Platform</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Direct market access and support for small farmers
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">B2B Services</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comprehensive solutions for businesses including packaging and certification
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <ShoppingCart className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Consumer Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                High-quality agricultural products with full traceability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Trusted by Many</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Hear from our satisfied partners and customers
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-lg bg-white dark:bg-card"
              >
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.quote}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tracking Section */}
      <section id="track-product" className="w-full py-12 md:py-24 lg:py-32 bg-green-50/50 dark:bg-green-950/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Track Your Product</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover the story behind your product and verify its authenticity
              </p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <TrackProductForm />
              <p className="text-sm text-muted-foreground">
                Find the tracking code on your product label or scan the QR code
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Heart className="h-6 w-6 fill-current" />
                <span className="text-lg font-medium">Support Our Farmers</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Donate to Your Loved Farmers</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Show your appreciation by supporting the farmers who bring you high-quality, natural products. Your
                  contribution helps create sustainable livelihoods and stronger communities.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/farmers/donate">
                    <HandHeart className="mr-2 h-5 w-5" />
                    Support Our Farmers
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/farmers/donate#learn-more">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl lg:aspect-square">
              <Image
                alt="Moroccan farmer showing traditional produce"
                className="object-cover w-full h-full"
                height={600}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ShrW78w5UTdiIvbnTLfKmZcMVeKLq0.png"
                width={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Choose Your Path</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join EMMYOR today and be part of the agricultural revolution
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[600px]">
              <Button asChild size="lg" className="w-full">
                <Link href="/shop">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shop Products
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/farmers/register">
                  <Tractor className="mr-2 h-4 w-4" />
                  Join as Farmer
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href="/b2b">
                  <Package className="mr-2 h-4 w-4" />
                  B2B Services
                </Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link href="/contact?type=investor">
                  <Users className="mr-2 h-4 w-4" />
                  Invest With Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const testimonials = [
  {
    quote:
      "EMMYOR has transformed how I connect with global markets. Their platform made it simple to reach new customers.",
    name: "Fatima Benali",
    role: "Organic Farmer",
  },
  {
    quote:
      "The quality of products and packaging solutions provided by EMMYOR has helped us scale our business significantly.",
    name: "Hassan El Mansouri",
    role: "B2B Client",
  },
  {
    quote: "I love being able to trace my products back to the source. It gives me confidence in what I'm buying.",
    name: "Amina Tazi",
    role: "Consumer",
  },
]
