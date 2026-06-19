"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, User, Calendar, Package, Heart, PlayCircle } from "lucide-react"

interface TrackingData {
  tracking: {
    id: string
    sku: string
    qrCodeUrl: string
    batchNumber: string | null
    createdAt: string
    product: {
      id: string
      name: string
      nameAr: string | null
      description: string | null
      descriptionAr: string | null
      price: number
      unit: string | null
      origin: string | null
      image: string | null
      farmer: {
        id: string
        farmLocation: string | null
        experience: number | null
        certifications: string | null
        user: {
          fullName: string
          email: string
          phoneNumber: string | null
        }
      }
      trackingTimeline: Array<{
        id: string
        stage: string
        date: string
        details: string | null
        type: string
      }>
    }
  }
  farmMedia: Array<{
    id: string
    mediaType: string
    url: string
    caption: string | null
  }>
  donationCampaigns: Array<{
    id: string
    title: string
    targetAmount: number
    currentAmount: number
    deadline: string | null
  }>
}

export default function TrackPage() {
  const params = useParams()
  const productId = params.productId as string
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrackingData() {
      try {
        // Try to fetch by SKU first, then by productId
        let response = await fetch(`/api/track/${productId}`)
        let result = await response.json()
        
        if (!response.ok) {
          // If SKU lookup fails, try productId lookup
          response = await fetch(`/api/track/product/${productId}`)
          result = await response.json()
        }
        
        if (response.ok) {
          setData(result)
          // Log scan analytics
          await fetch(`/api/track/${productId}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userAgent: navigator.userAgent,
              referrer: document.referrer
            })
          })
        } else {
          setError(result.error || 'Failed to load tracking data')
        }
      } catch (err) {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrackingData()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Product Not Found</CardTitle>
            <CardDescription>
              {error || 'This product does not exist or tracking is not enabled.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { tracking, farmMedia, donationCampaigns } = data
  const product = tracking.product
  const farmer = product.farmer
  const timeline = product.trackingTimeline

  const progress = timeline.length > 0 ? (timeline.length / 3) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-emerald-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Product Traceability</h1>
          <p className="text-emerald-100">Track your product from farm to table</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {product.description}
                  </CardDescription>
                </div>
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">SKU: {tracking.sku}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-gray-600">{product.origin || 'Morocco'}</span>
                </div>
                {tracking.batchNumber && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Batch: {tracking.batchNumber}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    {product.price} DH / {product.unit || 'unit'}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Farmer Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Farmer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">{farmer.user.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {farmer.farmLocation}
                  </div>
                  {farmer.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {farmer.experience} years experience
                    </div>
                  )}
                  {farmer.certifications && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {JSON.parse(farmer.certifications).map((cert: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Production Timeline */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Production Timeline
                </h3>
                <div className="space-y-3">
                  {timeline.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No timeline entries yet</p>
                  ) : (
                    timeline.map((entry, index) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            entry.type === 'RECEPTION' ? 'bg-blue-500' :
                            entry.type === 'PROCESSING' ? 'bg-amber-500' :
                            'bg-green-500'
                          }`} />
                          {index < timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{entry.stage}</p>
                            <Badge variant={
                              entry.type === 'RECEPTION' ? 'default' :
                              entry.type === 'PROCESSING' ? 'secondary' :
                              'outline'
                            }>
                              {entry.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                          {entry.details && (
                            <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Farm Media */}
            {farmMedia.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Farm Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {farmMedia.map((media) => (
                    <div key={media.id} className="relative">
                      {media.mediaType === 'VIDEO' ? (
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                          <PlayCircle className="h-12 w-12 text-gray-400" />
                        </div>
                      ) : (
                        <img 
                          src={media.url} 
                          alt={media.caption || 'Farm media'}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      {media.caption && (
                        <p className="text-xs text-gray-500 mt-1">{media.caption}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Donation Campaigns */}
            {donationCampaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Support This Farmer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {donationCampaigns.map((campaign) => {
                    const percentage = (campaign.currentAmount / campaign.targetAmount) * 100
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <h4 className="font-medium text-sm">{campaign.title}</h4>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{campaign.currentAmount} DH</span>
                          <span>{campaign.targetAmount} DH</span>
                        </div>
                        <Button size="sm" className="w-full">
                          Donate Now
                        </Button>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Production Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completed Stages</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-emerald-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {timeline.length} of 3 production stages completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
