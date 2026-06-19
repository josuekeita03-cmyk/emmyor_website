"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image?: string
  }
}

interface GuestCartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image?: string
  }
}

const SHIPPING_ZONES = [
  { id: "casablanca", name: "Casablanca", cost: 20 },
  { id: "rabat", name: "Rabat", cost: 25 },
  { id: "marrakech", name: "Marrakech", cost: 30 },
  { id: "fes", name: "Fès", cost: 35 },
  { id: "tanger", name: "Tanger", cost: 40 },
  { id: "agadir", name: "Agadir", cost: 35 },
  { id: "other", name: "Other Cities", cost: 50 },
]

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])
  const [total, setTotal] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [selectedZone, setSelectedZone] = useState("")
  const [loading, setLoading] = useState(true)
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("+212")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [customerNote, setCustomerNote] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")

  useEffect(() => {
    loadCart()
  }, [status])

  const loadCart = async () => {
    setLoading(true)
    
    if (status === "authenticated") {
      // Fetch from server for authenticated users
      try {
        const response = await fetch("/api/cart")
        const data = await response.json()
        setCartItems(data.items || [])
        setTotal(data.total || 0)
        
        // Clear localStorage after successful merge
        localStorage.removeItem("guestCart")
      } catch (error) {
        console.error("Error fetching cart:", error)
      }
    } else {
      // Load from localStorage for guests
      const savedCart = localStorage.getItem("guestCart")
      if (savedCart) {
        setGuestCart(JSON.parse(savedCart))
        const guestTotal = JSON.parse(savedCart).reduce(
          (sum: number, item: GuestCartItem) => sum + item.product.price * item.quantity,
          0
        )
        setTotal(guestTotal)
      }
    }
    
    setLoading(false)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    if (status === "authenticated") {
      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity }),
        })

        if (response.ok) {
          loadCart()
        }
      } catch (error) {
        console.error("Error updating quantity:", error)
      }
    } else {
      // Update localStorage for guests
      const updatedCart = guestCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      setGuestCart(updatedCart)
      localStorage.setItem("guestCart", JSON.stringify(updatedCart))
      loadCart()
    }
  }

  const removeItem = async (itemId: string) => {
    if (status === "authenticated") {
      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          loadCart()
        }
      } catch (error) {
        console.error("Error removing item:", error)
      }
    } else {
      // Remove from localStorage for guests
      const updatedCart = guestCart.filter((item) => item.id !== itemId)
      setGuestCart(updatedCart)
      localStorage.setItem("guestCart", JSON.stringify(updatedCart))
      loadCart()
    }
  }

  const handleWhatsAppOrder = async () => {
    const whatsappNumber = selectedCountry + phoneNumber
    if (!phoneNumber) {
      alert("Please enter your phone number")
      return
    }

    const items = (status === "authenticated" ? cartItems : guestCart).map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }))

    console.log("=== WhatsApp Order Request ===")
    console.log("WhatsApp number:", whatsappNumber)
    console.log("Items:", items)

    try {
      const response = await fetch("/api/whatsapp/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          whatsappNumber,
        }),
      })
      
      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)
      
      if (response.ok && data.whatsappUrl) {
        setShowWhatsAppDialog(false)
        setPhoneNumber("")
        setCustomerNote("")
        setCustomerAddress("")
        window.open(data.whatsappUrl, "_blank")
      } else {
        alert(data.error || data.details || "Failed to create WhatsApp order")
      }
    } catch (error) {
      console.error("Error ordering via WhatsApp:", error)
      alert("Error ordering via WhatsApp")
    }
  }

  const handleCheckout = () => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    router.push("/checkout")
  }

  const displayItems = status === "authenticated" ? cartItems : guestCart

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading cart...</div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some products to get started</p>
            <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const grandTotal = total + shipping

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {displayItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-muted-foreground">{item.product.price.toFixed(2)} MAD</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(item.product.price * item.quantity).toFixed(2)} MAD</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Shipping Zone</label>
                  <Select value={selectedZone} onValueChange={(value) => {
                    setSelectedZone(value)
                    const zone = SHIPPING_ZONES.find(z => z.id === value)
                    setShipping(zone?.cost || 0)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPPING_ZONES.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name} - {zone.cost} MAD
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{grandTotal.toFixed(2)} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowWhatsAppDialog(true)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Order via WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/shop")}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* WhatsApp Order Dialog */}
      {showWhatsAppDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Order via WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="whatsapp-country" className="text-sm font-medium mb-2 block">Country Code</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="whatsapp-country" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+93">🇫 Afghanistan (+93)</SelectItem>
                      <SelectItem value="+355">�🇱 Albania (+355)</SelectItem>
                      <SelectItem value="+213">�� Algeria (+213)</SelectItem>
                      <SelectItem value="+376">�� Andorra (+376)</SelectItem>
                      <SelectItem value="+54">�� Argentina (+54)</SelectItem>
                      <SelectItem value="+374">�� Armenia (+374)</SelectItem>
                      <SelectItem value="+61">�� Australia (+61)</SelectItem>
                      <SelectItem value="+43">�🇹 Austria (+43)</SelectItem>
                      <SelectItem value="+994">🇦� Azerbaijan (+994)</SelectItem>
                      <SelectItem value="+973">�� Bahrain (+973)</SelectItem>
                      <SelectItem value="+880">🇧🇩 Bangladesh (+880)</SelectItem>
                      <SelectItem value="+375">🇧🇾 Belarus (+375)</SelectItem>
                      <SelectItem value="+32">�� Belgium (+32)</SelectItem>
                      <SelectItem value="+501">�🇿 Belize (+501)</SelectItem>
                      <SelectItem value="+229">�� Benin (+229)</SelectItem>
                      <SelectItem value="+591">�� Bolivia (+591)</SelectItem>
                      <SelectItem value="+387">�🇦 Bosnia (+387)</SelectItem>
                      <SelectItem value="+55">🇧🇷 Brazil (+55)</SelectItem>
                      <SelectItem value="+673">🇧🇳 Brunei (+673)</SelectItem>
                      <SelectItem value="+359">�� Bulgaria (+359)</SelectItem>
                      <SelectItem value="+226">�� Burkina Faso (+226)</SelectItem>
                      <SelectItem value="+95">�� Myanmar (+95)</SelectItem>
                      <SelectItem value="+257">�� Burundi (+257)</SelectItem>
                      <SelectItem value="+855">�� Cambodia (+855)</SelectItem>
                      <SelectItem value="+237">�� Cameroon (+237)</SelectItem>
                      <SelectItem value="+1">�� Canada (+1)</SelectItem>
                      <SelectItem value="+238">🇨� Cape Verde (+238)</SelectItem>
                      <SelectItem value="+236">🇨🇫 Central African Republic (+236)</SelectItem>
                      <SelectItem value="+235">�� Chad (+235)</SelectItem>
                      <SelectItem value="+56">🇨🇱 Chile (+56)</SelectItem>
                      <SelectItem value="+86">�� China (+86)</SelectItem>
                      <SelectItem value="+57">🇨🇴 Colombia (+57)</SelectItem>
                      <SelectItem value="+269">�� Comoros (+269)</SelectItem>
                      <SelectItem value="+242">🇨🇬 Congo (+242)</SelectItem>
                      <SelectItem value="+243">�� Congo DRC (+243)</SelectItem>
                      <SelectItem value="+506">🇨🇷 Costa Rica (+506)</SelectItem>
                      <SelectItem value="+385">🇭� Croatia (+385)</SelectItem>
                      <SelectItem value="+53">�� Cuba (+53)</SelectItem>
                      <SelectItem value="+357">🇨� Cyprus (+357)</SelectItem>
                      <SelectItem value="+420">🇨🇿 Czech Republic (+420)</SelectItem>
                      <SelectItem value="+45">�� Denmark (+45)</SelectItem>
                      <SelectItem value="+253">🇩🇯 Djibouti (+253)</SelectItem>
                      <SelectItem value="+1">🇩🇴 Dominican Republic (+1)</SelectItem>
                      <SelectItem value="+593">🇪🇨 Ecuador (+593)</SelectItem>
                      <SelectItem value="+20">🇪🇬 Egypt (+20)</SelectItem>
                      <SelectItem value="+503">�� El Salvador (+503)</SelectItem>
                      <SelectItem value="+240">�� Equatorial Guinea (+240)</SelectItem>
                      <SelectItem value="+291">�� Eritrea (+291)</SelectItem>
                      <SelectItem value="+372">🇪🇪 Estonia (+372)</SelectItem>
                      <SelectItem value="+251">�🇹 Ethiopia (+251)</SelectItem>
                      <SelectItem value="+679">🇫🇯 Fiji (+679)</SelectItem>
                      <SelectItem value="+358">🇫🇮 Finland (+358)</SelectItem>
                      <SelectItem value="+33">�� France (+33)</SelectItem>
                      <SelectItem value="+241">🇬🇦 Gabon (+241)</SelectItem>
                      <SelectItem value="+220">🇬🇲 Gambia (+220)</SelectItem>
                      <SelectItem value="+995">�🇪 Georgia (+995)</SelectItem>
                      <SelectItem value="+49">🇩🇪 Germany (+49)</SelectItem>
                      <SelectItem value="+233">🇬🇭 Ghana (+233)</SelectItem>
                      <SelectItem value="+30">�� Greece (+30)</SelectItem>
                      <SelectItem value="+299">🇬🇱 Greenland (+299)</SelectItem>
                      <SelectItem value="+502">�🇹 Guatemala (+502)</SelectItem>
                      <SelectItem value="+224">�� Guinea (+224)</SelectItem>
                      <SelectItem value="+245">�� Guinea-Bissau (+245)</SelectItem>
                      <SelectItem value="+592">�� Guyana (+592)</SelectItem>
                      <SelectItem value="+509">�� Haiti (+509)</SelectItem>
                      <SelectItem value="+504">🇭🇳 Honduras (+504)</SelectItem>
                      <SelectItem value="+36">�� Hungary (+36)</SelectItem>
                      <SelectItem value="+354">�� Iceland (+354)</SelectItem>
                      <SelectItem value="+91">🇮🇳 India (+91)</SelectItem>
                      <SelectItem value="+62">�� Indonesia (+62)</SelectItem>
                      <SelectItem value="+98">�� Iran (+98)</SelectItem>
                      <SelectItem value="+964">�� Iraq (+964)</SelectItem>
                      <SelectItem value="+353">🇮🇪 Ireland (+353)</SelectItem>
                      <SelectItem value="+972">�� Israel (+972)</SelectItem>
                      <SelectItem value="+39">🇮🇹 Italy (+39)</SelectItem>
                      <SelectItem value="+225">🇨🇮 Ivory Coast (+225)</SelectItem>
                      <SelectItem value="+81">�� Japan (+81)</SelectItem>
                      <SelectItem value="+962">🇯🇴 Jordan (+962)</SelectItem>
                      <SelectItem value="+7">🇰🇿 Kazakhstan (+7)</SelectItem>
                      <SelectItem value="+254">🇰🇪 Kenya (+254)</SelectItem>
                      <SelectItem value="+965">�� Kuwait (+965)</SelectItem>
                      <SelectItem value="+996">🇰🇬 Kyrgyzstan (+996)</SelectItem>
                      <SelectItem value="+856">�� Laos (+856)</SelectItem>
                      <SelectItem value="+371">🇱🇻 Latvia (+371)</SelectItem>
                      <SelectItem value="+961">🇱🇧 Lebanon (+961)</SelectItem>
                      <SelectItem value="+266">🇱🇸 Lesotho (+266)</SelectItem>
                      <SelectItem value="+231">�� Liberia (+231)</SelectItem>
                      <SelectItem value="+218">�� Libya (+218)</SelectItem>
                      <SelectItem value="+423">�🇮 Liechtenstein (+423)</SelectItem>
                      <SelectItem value="+370">🇱🇹 Lithuania (+370)</SelectItem>
                      <SelectItem value="+352">�� Luxembourg (+352)</SelectItem>
                      <SelectItem value="+853">🇲🇴 Macau (+853)</SelectItem>
                      <SelectItem value="+389">🇲🇰 North Macedonia (+389)</SelectItem>
                      <SelectItem value="+261">🇲� Madagascar (+261)</SelectItem>
                      <SelectItem value="+265">�� Malawi (+265)</SelectItem>
                      <SelectItem value="+60">�� Malaysia (+60)</SelectItem>
                      <SelectItem value="+960">🇲🇻 Maldives (+960)</SelectItem>
                      <SelectItem value="+223">�� Mali (+223)</SelectItem>
                      <SelectItem value="+356">🇲🇹 Malta (+356)</SelectItem>
                      <SelectItem value="+692">�� Marshall Islands (+692)</SelectItem>
                      <SelectItem value="+222">�� Mauritania (+222)</SelectItem>
                      <SelectItem value="+230">🇺 Mauritius (+230)</SelectItem>
                      <SelectItem value="+52">🇲🇽 Mexico (+52)</SelectItem>
                      <SelectItem value="+373">🇲🇩 Moldova (+373)</SelectItem>
                      <SelectItem value="+377">�� Monaco (+377)</SelectItem>
                      <SelectItem value="+976">�� Mongolia (+976)</SelectItem>
                      <SelectItem value="+382">🇲🇪 Montenegro (+382)</SelectItem>
                      <SelectItem value="+212">🇲🇦 Morocco (+212)</SelectItem>
                      <SelectItem value="+258">�🇿 Mozambique (+258)</SelectItem>
                      <SelectItem value="+95">🇲🇲 Myanmar (+95)</SelectItem>
                      <SelectItem value="+264">�� Namibia (+264)</SelectItem>
                      <SelectItem value="+674">�� Nauru (+674)</SelectItem>
                      <SelectItem value="+977">🇳🇵 Nepal (+977)</SelectItem>
                      <SelectItem value="+31">�� Netherlands (+31)</SelectItem>
                      <SelectItem value="+64">🇳🇿 New Zealand (+64)</SelectItem>
                      <SelectItem value="+505">�� Nicaragua (+505)</SelectItem>
                      <SelectItem value="+227">🇳🇪 Niger (+227)</SelectItem>
                      <SelectItem value="+234">🇳🇬 Nigeria (+234)</SelectItem>
                      <SelectItem value="+383">🇽🇰 Kosovo (+383)</SelectItem>
                      <SelectItem value="+850">�� North Korea (+850)</SelectItem>
                      <SelectItem value="+47">🇳🇴 Norway (+47)</SelectItem>
                      <SelectItem value="+968">🇴🇲 Oman (+968)</SelectItem>
                      <SelectItem value="+92">🇵🇰 Pakistan (+92)</SelectItem>
                      <SelectItem value="+680">�� Palau (+680)</SelectItem>
                      <SelectItem value="+507">�� Panama (+507)</SelectItem>
                      <SelectItem value="+675">�� Papua New Guinea (+675)</SelectItem>
                      <SelectItem value="+595">�� Paraguay (+595)</SelectItem>
                      <SelectItem value="+51">�� Peru (+51)</SelectItem>
                      <SelectItem value="+63">🇵🇭 Philippines (+63)</SelectItem>
                      <SelectItem value="+48">�� Poland (+48)</SelectItem>
                      <SelectItem value="+351">�� Portugal (+351)</SelectItem>
                      <SelectItem value="+974">�� Qatar (+974)</SelectItem>
                      <SelectItem value="+40">�� Romania (+40)</SelectItem>
                      <SelectItem value="+7">�� Russia (+7)</SelectItem>
                      <SelectItem value="+250">�� Rwanda (+250)</SelectItem>
                      <SelectItem value="+966">🇸🇦 Saudi Arabia (+966)</SelectItem>
                      <SelectItem value="+221">�� Senegal (+221)</SelectItem>
                      <SelectItem value="+381">🇷🇸 Serbia (+381)</SelectItem>
                      <SelectItem value="+248">🇸🇨 Seychelles (+248)</SelectItem>
                      <SelectItem value="+232">�� Sierra Leone (+232)</SelectItem>
                      <SelectItem value="+65">🇬 Singapore (+65)</SelectItem>
                      <SelectItem value="+421">�🇰 Slovakia (+421)</SelectItem>
                      <SelectItem value="+386">�� Slovenia (+386)</SelectItem>
                      <SelectItem value="+27">�� South Africa (+27)</SelectItem>
                      <SelectItem value="+82">�� South Korea (+82)</SelectItem>
                      <SelectItem value="+34">�� Spain (+34)</SelectItem>
                      <SelectItem value="+94">�� Sri Lanka (+94)</SelectItem>
                      <SelectItem value="+249">🇸🇩 Sudan (+249)</SelectItem>
                      <SelectItem value="+597">�� Suriname (+597)</SelectItem>
                      <SelectItem value="+46">🇸🇪 Sweden (+46)</SelectItem>
                      <SelectItem value="+41">�� Switzerland (+41)</SelectItem>
                      <SelectItem value="+963">�� Syria (+963)</SelectItem>
                      <SelectItem value="+886">🇹🇼 Taiwan (+886)</SelectItem>
                      <SelectItem value="+992">�� Tajikistan (+992)</SelectItem>
                      <SelectItem value="+255">�� Tanzania (+255)</SelectItem>
                      <SelectItem value="+66">🇹� Thailand (+66)</SelectItem>
                      <SelectItem value="+228">🇹🇬 Togo (+228)</SelectItem>
                      <SelectItem value="+676">🇹🇴 Tonga (+676)</SelectItem>
                      <SelectItem value="+216">�� Tunisia (+216)</SelectItem>
                      <SelectItem value="+90">🇹🇷 Turkey (+90)</SelectItem>
                      <SelectItem value="+993">�� Turkmenistan (+993)</SelectItem>
                      <SelectItem value="+688">🇹🇻 Tuvalu (+688)</SelectItem>
                      <SelectItem value="+380">�� Ukraine (+380)</SelectItem>
                      <SelectItem value="+971">🇦🇪 UAE (+971)</SelectItem>
                      <SelectItem value="+44">�� UK (+44)</SelectItem>
                      <SelectItem value="+1">🇺🇸 USA (+1)</SelectItem>
                      <SelectItem value="+598">�� Uruguay (+598)</SelectItem>
                      <SelectItem value="+998">🇺🇿 Uzbekistan (+998)</SelectItem>
                      <SelectItem value="+678">�� Vanuatu (+678)</SelectItem>
                      <SelectItem value="+58">�� Venezuela (+58)</SelectItem>
                      <SelectItem value="+84">�� Vietnam (+84)</SelectItem>
                      <SelectItem value="+967">�� Yemen (+967)</SelectItem>
                      <SelectItem value="+260">🇿🇲 Zambia (+260)</SelectItem>
                      <SelectItem value="+263">�� Zimbabwe (+263)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="whatsapp-phone-number" className="text-sm font-medium mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    id="whatsapp-phone-number"
                    name="whatsapp-phone-number"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp-address" className="text-sm font-medium mb-2 block">Delivery Address</label>
                  <input
                    type="text"
                    id="whatsapp-address"
                    name="whatsapp-address"
                    placeholder="Delivery address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    autoComplete="street-address"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp-note" className="text-sm font-medium mb-2 block">Order Note (Optional)</label>
                  <input
                    type="text"
                    id="whatsapp-note"
                    name="whatsapp-note"
                    placeholder="Any special instructions..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleWhatsAppOrder} className="flex-1">
                Send Order via WhatsApp
              </Button>
              <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)} className="flex-1">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
