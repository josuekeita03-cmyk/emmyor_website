"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Check } from "lucide-react"

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [processing, setProcessing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("CARD")
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })
  const [cardType, setCardType] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      loadCart()
      // Pre-fill form with user data
      setFormData({
        fullName: (session.user as any)?.fullName || "",
        email: session.user?.email || "",
        phone: (session.user as any)?.phoneNumber || "",
        address: "",
        city: (session.user as any)?.city || "",
        postalCode: "",
        notes: "",
      })
    }
  }, [status, session, router])

  const loadCart = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      setCartItems(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "")
    if (/^4/.test(cleaned)) return "VISA"
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "MASTERCARD"
    if (/^3[47]/.test(cleaned)) return "AMERICAN_EXPRESS"
    if (/^6/.test(cleaned)) return "CMI"
    return ""
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "")
    let formatted = ""
    
    // Add spaces every 4 digits for better readability
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " "
      }
      formatted += value[i]
    }
    
    setCardData({ ...cardData, cardNumber: formatted })
    setCardType(detectCardType(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      console.log("=== Checkout Form Submit ===")
      console.log("Form data:", formData)
      console.log("Shipping:", shipping)
      console.log("Payment method:", paymentMethod)

      // Validate card data if card payment is selected
      if (paymentMethod === "CARD") {
        const cleanedCardNumber = cardData.cardNumber.replace(/\s/g, "")
        if (!cleanedCardNumber || cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
          alert("Please enter a valid card number")
          setProcessing(false)
          return
        }
        if (!cardData.cardholderName || cardData.cardholderName.trim().length < 2) {
          alert("Please enter the cardholder name")
          setProcessing(false)
          return
        }
        if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
          alert("Please enter a valid expiry date")
          setProcessing(false)
          return
        }
        if (!cardData.cvv || cardData.cvv.length < 3) {
          alert("Please enter a valid CVV")
          setProcessing(false)
          return
        }

        // Process card payment first
        console.log("Processing card payment...")
        const paymentResponse = await fetch("/api/payments/card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardData,
            amount: total + shipping,
          }),
        })

        const paymentData = await paymentResponse.json()
        console.log("Payment response:", paymentData)

        if (!paymentResponse.ok || !paymentData.success) {
          alert(paymentData.error || "Payment processing failed")
          setProcessing(false)
          return
        }

        console.log("Payment successful, transaction ID:", paymentData.transactionId)
      }

      // Create order after successful payment (or for other payment methods)
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shipping,
          paymentMethod,
          cardData: paymentMethod === "CARD" ? cardData : undefined,
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        if (paymentMethod === "WHATSAPP") {
          // Redirect to cart for WhatsApp orders (they're handled via cart dialog)
          router.push("/cart")
        } else {
          // For card and bank transfer, redirect to cart
          router.push("/cart")
        }
      } else {
        alert(data.error || data.details || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error creating order")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading checkout...</div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some products to checkout</p>
            <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const grandTotal = total + shipping

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    autoComplete="street-address"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..."
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === "BANK_TRANSFER" && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Bank Transfer Details</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Please transfer the total amount to the following bank account:
                      </p>
                      <div className="space-y-1 text-sm">
                        <p><strong>Bank:</strong> Attijariwafa Bank</p>
                        <p><strong>Account Name:</strong> EMMYOR SARL</p>
                        <p><strong>Account Number:</strong> XXXXXXXXXXXXXXXXXX</p>
                        <p><strong>RIB:</strong> XXX XXX XXXXXXXXXXXXXXXXX XXX</p>
                        <p><strong>SWIFT/BIC:</strong> XXXXXXXXXXX</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your order will be processed once we receive the transfer confirmation.
                      </p>
                    </CardContent>
                  </Card>
                )}
                {paymentMethod === "CARD" && (
                  <Card className="bg-muted">
                    <CardContent className="p-4 space-y-4">
                      <h4 className="font-semibold mb-2">Card Payment Details</h4>
                      
                      <div>
                        <Label htmlFor="cardType">Card Type</Label>
                        <Select>
                          <SelectTrigger id="cardType">
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VISA">VISA</SelectItem>
                            <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                            <SelectItem value="CMI">CMI</SelectItem>
                            <SelectItem value="AMEX">American Express</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={cardData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "")
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + "/" + value.slice(2)
                              }
                              if (value.length > 5) {
                                value = value.slice(0, 5)
                              }
                              setCardData({ ...cardData, expiryDate: value })
                            }}
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "")
                              if (value.length <= 4) {
                                setCardData({ ...cardData, cvv: value })
                              }
                            }}
                            maxLength={4}
                            type="password"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardHolder">Cardholder Name</Label>
                        <Input
                          id="cardHolder"
                          name="cardHolder"
                          placeholder="Name on card"
                          value={cardData.cardholderName}
                          onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Payment Gateway:</strong> XXX Payment Gateway</p>
                        <p><strong>Payment Processor:</strong> XXX Payment Processor</p>
                        <p><strong>Card Networks:</strong> VISA, Mastercard, CMI, American Express</p>
                        <p><strong>Acquiring Bank:</strong> XXX Bank (RIB: XXXXXXXXXXXXXXXXXXXX)</p>
                        <p><strong>Issuing Bank:</strong> Your card-issuing bank</p>
                        <p className="mt-2">Your payment is secured with industry-standard encryption.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {paymentMethod === "WHATSAPP" && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">WhatsApp Order</h4>
                      <p className="text-sm text-muted-foreground">
                        You will be redirected to WhatsApp to complete your order. Our team will contact you to confirm payment and delivery details.
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={processing}>
                  {processing ? "Processing..." : `Place Order (${paymentMethod === "WHATSAPP" ? "via WhatsApp" : paymentMethod === "BANK_TRANSFER" ? "with Bank Transfer" : "with Card"})`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{(item.product.price * item.quantity).toFixed(2)} MAD</span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{total.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping.toFixed(2)} MAD</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{grandTotal.toFixed(2)} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
