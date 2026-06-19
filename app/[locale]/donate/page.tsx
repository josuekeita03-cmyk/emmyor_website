"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeartHandshake, CreditCard, Loader2, Users, Target, Filter, X } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DonatePage({ params }: { params: { locale: Locale } }) {
  const { data: session } = useSession()
  const { locale } = params
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [donationType, setDonationType] = useState<"direct" | "campaign">("direct")
  const [cardType, setCardType] = useState("")
  const [farmers, setFarmers] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [filterOptions, setFilterOptions] = useState<any>({ locations: [], experiences: [] })
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    location: "",
    experience: "",
  })
  const [formData, setFormData] = useState({
    farmerId: "",
    campaignId: "",
    amount: "",
    currency: "MAD",
    message: "",
    paymentMethod: "CMI",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    fetchFarmers()
    fetchCampaigns()
  }, [])

  const fetchFarmers = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedFilters.location && selectedFilters.location !== "all") {
        params.append("location", selectedFilters.location)
      }
      if (selectedFilters.experience && selectedFilters.experience !== "all") {
        params.append("experience", selectedFilters.experience)
      }
      
      const response = await fetch(`/api/farmers?${params}`)
      const data = await response.json()
      setFarmers(data.farmers || [])
      setFilterOptions(data.filters || { locations: [], experiences: [] })
    } catch (error) {
      console.error("Error fetching farmers:", error)
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [selectedFilters])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/donation-campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
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
    
    setFormData({ ...formData, cardNumber: formatted })
    setCardType(detectCardType(value))
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2)
    }
    if (value.length > 5) {
      value = value.slice(0, 5)
    }
    setFormData({ ...formData, expiryDate: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate card data
      const cleanedCardNumber = formData.cardNumber.replace(/\s/g, "")
      if (!cleanedCardNumber || cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
        alert("Please enter a valid card number")
        setLoading(false)
        return
      }
      if (!formData.cardHolder || formData.cardHolder.trim().length < 2) {
        alert("Please enter the cardholder name")
        setLoading(false)
        return
      }
      if (!formData.expiryDate || formData.expiryDate.length < 5) {
        alert("Please enter a valid expiry date")
        setLoading(false)
        return
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        alert("Please enter a valid CVV")
        setLoading(false)
        return
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          cardDetails: {
            cardNumber: formData.cardNumber,
            cardHolder: formData.cardHolder,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          },
          locale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          farmerId: "",
          campaignId: "",
          amount: "",
          currency: "MAD",
          message: "",
          paymentMethod: "CMI",
          cardNumber: "",
          cardHolder: "",
          expiryDate: "",
          cvv: "",
        })
        setCardType("")
      } else {
        alert(data.error || "Failed to process donation")
      }
    } catch (error) {
      console.error("Error submitting donation:", error)
      alert("Failed to process donation")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              Make a Donation
            </CardTitle>
            <CardDescription>Please sign in to make a donation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={`/${locale}/login`}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <HeartHandshake className="h-5 w-5" />
              Thank You for Your Donation!
            </CardTitle>
            <CardDescription>Your donation has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You will receive a confirmation email shortly with your donation details.
            </p>
            <Button asChild>
              <a href={`/${locale}/dashboard/customer`}>Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <HeartHandshake className="h-8 w-8 text-green-600" />
            Support Moroccan Farmers
          </h1>
          <p className="text-muted-foreground">
            Make a direct contribution to farmers or support community campaigns
          </p>
        </div>

        {/* Donation Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Donation Type</CardTitle>
            <CardDescription>Select how you'd like to contribute</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button
                variant={donationType === "direct" ? "default" : "outline"}
                className="h-24 flex flex-col gap-2"
                onClick={() => setDonationType("direct")}
              >
                <Users className="h-6 w-6" />
                <span>Direct to Farmer</span>
              </Button>
              <Button
                variant={donationType === "campaign" ? "default" : "outline"}
                className="h-24 flex flex-col gap-2"
                onClick={() => setDonationType("campaign")}
              >
                <Target className="h-6 w-6" />
                <span>Campaign Support</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
            <CardDescription>Enter your donation information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {donationType === "direct" ? (
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="farmerId">Select Farmer (Optional)</Label>
                    <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter Farmers
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Filter Farmers</DialogTitle>
                          <DialogDescription>Select filters to find the right farmer</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label>Location</Label>
                            <Select
                              value={selectedFilters.location}
                              onValueChange={(value) => setSelectedFilters({ ...selectedFilters, location: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All locations" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All locations</SelectItem>
                                {filterOptions.locations
                                  .sort((a: string, b: string) => a.localeCompare(b))
                                  .map((location: string) => (
                                    <SelectItem key={location} value={location}>
                                      {location}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Experience (Years)</Label>
                            <Select
                              value={selectedFilters.experience}
                              onValueChange={(value) => setSelectedFilters({ ...selectedFilters, experience: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All experience levels" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All experience levels</SelectItem>
                                {filterOptions.experiences
                                  .sort((a: number, b: number) => a - b)
                                  .map((experience: number) => (
                                    <SelectItem key={experience} value={experience.toString()}>
                                      {experience} years
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedFilters({ location: "all", experience: "all" })
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear Filters
                            </Button>
                            <Button onClick={() => setShowFilterModal(false)}>Apply Filters</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a farmer to support directly" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">General Fund</SelectItem>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.user.fullName} - {farmer.farmLocation || "Location not specified"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="campaignId">Select Campaign</Label>
                  <Select
                    value={formData.campaignId}
                    onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign to support" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a campaign</SelectItem>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title} - {campaign.currentAmount} / {campaign.targetAmount} MAD
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (MAD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Share a message with the farmer..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CMI">CMI (Credit Card)</SelectItem>
                    <SelectItem value="STRIPE">Stripe (Credit Card)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gray-50 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                    {cardType && (
                      <p className="text-sm text-muted-foreground">Detected: {cardType}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cardHolder">Card Holder Name</Label>
                    <Input
                      id="cardHolder"
                      placeholder="John Doe"
                      value={formData.cardHolder}
                      onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleExpiryDateChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        maxLength={3}
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HeartHandshake className="mr-2 h-4 w-4" />
                    Donate {formData.amount || "0"} MAD
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Community Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-sm text-muted-foreground">Total Donors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <HeartHandshake className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">456,789 MAD</p>
              <p className="text-sm text-muted-foreground">Total Donated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Active Campaigns</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
