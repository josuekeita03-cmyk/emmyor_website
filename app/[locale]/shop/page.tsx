"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Users,
  Search,
  Nut,
  Cookie,
  BeanOffIcon as PeanutOff,
  Droplet,
  Flower2,
  BellIcon as Pepper,
  Grid,
  ShoppingCart,
  MessageCircle,
  Package,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

// Floating WhatsApp Button Component
function FloatingWhatsAppButton() {
  const handleClick = () => {
    window.open("https://wa.me/212656271147", "_blank")
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 md:hidden"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )
}

export default function ShopPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [category, setCategory] = useState(searchParams.get("category") || "all")

  const userRole = session?.user?.role
  const canUseCart = ["CUSTOMER", "ADMIN"].includes(userRole || "")

  const handleCategoryChange = (e: React.MouseEvent, newCategory: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCategory(newCategory)
  }
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setCategory(categoryParam)
    }
  }, [searchParams])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, priceRange, sortBy, category])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(p => p.category === category)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by price range
    if (priceRange && priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      if (max) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max)
      } else if (priceRange === "201+") {
        filtered = filtered.filter(p => p.price >= 201)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "name-asc") return a.name.localeCompare(b.name)
      if (sortBy === "name-desc") return b.name.localeCompare(a.name)
      return 0
    })

    setFilteredProducts(filtered)
  }

  const addToCart = async (productId: string) => {
    console.log("=== ADD TO CART START ===")
    console.log("Product ID:", productId)
    try {
      console.log("Sending request to /api/cart/items")
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      const data = await response.json()
      console.log("Response data:", data)
      console.log("=== ADD TO CART END ===")
      if (response.ok) {
        alert("Added to cart!")
      } else {
        if (response.status === 401) {
          alert("Please sign in to add items to your cart")
        } else if (response.status === 404 && data.error === "Customer not found") {
          alert("Please sign in as a customer to add items to cart")
        } else {
          alert(data.error || "Failed to add to cart")
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding to cart")
    }
  }

  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("+212")
  const [phoneNumber, setPhoneNumber] = useState("")

  const orderViaWhatsApp = async (productId: string) => {
    setSelectedProductId(productId)
    setShowWhatsAppDialog(true)
  }

  const handleWhatsAppOrder = async () => {
    if (!selectedProductId) return
    
    const whatsappNumber = selectedCountry + phoneNumber
    if (!phoneNumber) {
      alert("Please enter your phone number")
      return
    }

    try {
      const response = await fetch("/api/whatsapp/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: selectedProductId, quantity: 1 }],
          whatsappNumber,
        }),
      })
      const data = await response.json()
      console.log("WhatsApp order response:", { status: response.status, ok: response.ok, data })
      if (response.ok && data.whatsappUrl) {
        setShowWhatsAppDialog(false)
        setPhoneNumber("")
        window.open(data.whatsappUrl, "_blank")
      } else {
        if (response.status === 401) {
          alert("Please sign in to order via WhatsApp")
        } else {
          alert(data.error || "Failed to create WhatsApp order")
        }
      }
    } catch (error) {
      console.error("Error ordering via WhatsApp:", error)
      alert("Error ordering via WhatsApp")
    }
  }
  return (
    <div className="flex flex-col min-h-screen">
      {/* WhatsApp Order Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order via WhatsApp</DialogTitle>
            <DialogDescription>
              Enter your WhatsApp number to place your order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+212">Morocco (+212)</SelectItem>
                  <SelectItem value="+223">Mali (+223)</SelectItem>
                  <SelectItem value="+1">USA (+1)</SelectItem>
                  <SelectItem value="+33">France (+33)</SelectItem>
                  <SelectItem value="+44">UK (+44)</SelectItem>
                  <SelectItem value="+49">Germany (+49)</SelectItem>
                  <SelectItem value="+34">Spain (+34)</SelectItem>
                  <SelectItem value="+39">Italy (+39)</SelectItem>
                  <SelectItem value="+971">UAE (+971)</SelectItem>
                  <SelectItem value="+966">Saudi Arabia (+966)</SelectItem>
                  <SelectItem value="+20">Egypt (+20)</SelectItem>
                  <SelectItem value="+213">Algeria (+213)</SelectItem>
                  <SelectItem value="+216">Tunisia (+216)</SelectItem>
                  <SelectItem value="+254">Kenya (+254)</SelectItem>
                  <SelectItem value="+27">South Africa (+27)</SelectItem>
                  <SelectItem value="+91">India (+91)</SelectItem>
                  <SelectItem value="+86">China (+86)</SelectItem>
                  <SelectItem value="+81">Japan (+81)</SelectItem>
                  <SelectItem value="+61">Australia (+61)</SelectItem>
                  <SelectItem value="+55">Brazil (+55)</SelectItem>
                  <SelectItem value="+52">Mexico (+52)</SelectItem>
                  <SelectItem value="+54">Argentina (+54)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="tel"
                id="whatsapp-phone-number"
                name="whatsapp-phone-number"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
                autoComplete="tel"
              />
            </div>
            <Button onClick={handleWhatsAppOrder} className="w-full">
              Send Order via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Shop Our Premium Products</h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover our curated selection of premium Moroccan products, from artisanal nuts to pure oils
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-6 md:py-12 border-b">
        <div className="container px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input 
                type="search" 
                placeholder="Search products..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-50">0-50 DH</SelectItem>
                <SelectItem value="51-100">51-100 DH</SelectItem>
                <SelectItem value="101-200">101-200 DH</SelectItem>
                <SelectItem value="201+">201+ DH</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "all")}
              >
                <Grid className="h-4 w-4" />
                All Products
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Raw Nuts" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Raw Nuts")}
              >
                <Nut className="h-4 w-4" />
                Raw Nuts
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Roasted Nuts" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Roasted Nuts")}
              >
                <Cookie className="h-4 w-4" />
                Roasted Nuts
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Nut Butters" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Nut Butters")}
              >
                <PeanutOff className="h-4 w-4" />
                Nut Butters
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Oils" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Oils")}
              >
                <Droplet className="h-4 w-4" />
                Oils
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Herbs" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Herbs")}
              >
                <Flower2 className="h-4 w-4" />
                Herbs
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Spices" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Spices")}
              >
                <Pepper className="h-4 w-4" />
                Spices
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Honey" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Honey")}
              >
                <Droplet className="h-4 w-4" />
                Honey
              </div>
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                  category === "Bulk Orders" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={(e) => handleCategoryChange(e, "Bulk Orders")}
              >
                <Package className="h-4 w-4" />
                Bulk Orders
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="text-center py-12">Loading products...</div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart} 
                      onWhatsAppOrder={orderViaWhatsApp}
                      canUseCart={canUseCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <FloatingWhatsAppButton />
    </div>
  )
}

function ProductCard({ product, onAddToCart, onWhatsAppOrder, canUseCart }: { product: any; onAddToCart: (id: string) => Promise<void>; onWhatsAppOrder: (id: string) => Promise<void>; canUseCart: boolean }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-square relative mb-2">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
          <Badge variant="secondary" className="mt-2">
            {product.price} DH{product.unit ? `/${product.unit}` : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-semibold">Origin:</span> {product.origin}
          </div>
          {product.packaging && (
            <div className="text-sm">
              <span className="font-semibold">Packaging:</span> {product.packaging}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {canUseCart && (
          <>
            <Button className="w-full" onClick={() => onAddToCart(product.id)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onWhatsAppOrder(product.id)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Order via WhatsApp
            </Button>
          </>
        )}
        {product.farmerId ? (
          <Button variant="ghost" className="w-full" asChild>
            <Link href={`/farmers/${product.farmerId}`}>
              <Users className="mr-2 h-4 w-4" />
              Meet the Farmers
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" className="w-full" disabled>
            <Users className="mr-2 h-4 w-4" />
            Meet the Farmers
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

