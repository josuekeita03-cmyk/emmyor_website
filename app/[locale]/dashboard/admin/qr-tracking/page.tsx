"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QrCode, Plus, Download, Eye, Calendar, X, ArrowLeft } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string | null
  image: string | null
  farmerId: string | null
  category: string | null
  price: number
}

interface ProductTracking {
  id: string
  productId: string
  sku: string
  qrCodeUrl: string | null
  batchNumber: string | null
  createdAt: string
  product: Product
}

export default function QRTrackingPage() {
  const params = useParams()
  const locale = params.locale as string
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [trackingList, setTrackingList] = useState<ProductTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [batchNumber, setBatchNumber] = useState("")
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false)
  const [selectedTracking, setSelectedTracking] = useState<ProductTracking | null>(null)
  const [timelineEntries, setTimelineEntries] = useState<any[]>([])
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    stage: '',
    date: '',
    details: '',
    type: 'RECEPTION'
  })
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  })

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch existing tracking first
        const trackingRes = await fetch('/api/admin/track/list')
        let trackingData = []
        if (trackingRes.ok) {
          const data = await trackingRes.json()
          trackingData = data.tracking || []
          setTrackingList(trackingData)
        }

        // Fetch products
        const productsRes = await fetch('/api/products')
        if (!productsRes.ok) {
          console.error('Failed to fetch products:', productsRes.status)
          setProducts([])
          setLoading(false)
          return
        }
        
        const productsResponse = await productsRes.json()
        console.log('Fetched products response:', productsResponse)
        
        // The API returns { products: [...], pagination: {...} }
        const productsData = productsResponse.products || []
        console.log('Fetched products:', productsData)
        
        // Filter products that have SKUs and are not already tracked
        const trackedProductIds = trackingData.map((t: ProductTracking) => t.productId)
        const productsWithoutTracking = productsData.filter((p: Product) => 
          p.sku && !trackedProductIds.includes(p.id)
        )
        
        console.log('Products without tracking:', productsWithoutTracking)
        console.log('Tracked product IDs:', trackedProductIds)
        
        // If no products with SKUs, show all products (for testing)
        if (productsWithoutTracking.length === 0 && productsData.length > 0) {
          console.log('No products with SKUs found, showing all products')
          setProducts(productsData)
          setFilteredProducts(productsData)
        } else {
          setProducts(productsWithoutTracking)
          setFilteredProducts(productsWithoutTracking)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters when filters change
  useEffect(() => {
    let filtered = [...products]
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice))
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice))
    }
    
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }
    
    setFilteredProducts(filtered)
  }, [filters, products])

  async function handleGenerateQR() {
    if (!selectedProduct) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/track/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          batchNumber: batchNumber || null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setQrCodeDataUrl(data.qrCodeDataUrl)
        setTrackingUrl(data.trackingUrl)
        setIsGenerateDialogOpen(false)
        // Refresh tracking list
        const trackingRes = await fetch('/api/admin/track/list')
        if (trackingRes.ok) {
          const trackingData = await trackingRes.json()
          setTrackingList(trackingData.tracking || [])
        }
      } else {
        alert(data.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadQRCode() {
    if (!qrCodeDataUrl) return
    
    const link = document.createElement('a')
    link.href = qrCodeDataUrl
    link.download = `qr-code-${selectedProduct}.png`
    link.click()
  }

  async function handleOpenTimeline(tracking: ProductTracking) {
    setSelectedTracking(tracking)
    setIsTimelineDialogOpen(true)
    
    // Fetch existing timeline entries
    try {
      const response = await fetch(`/api/track/${tracking.productId}`)
      const data = await response.json()
      if (response.ok && data.tracking?.product?.trackingTimeline) {
        setTimelineEntries(data.tracking.product.trackingTimeline)
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
    }
  }

  async function handleAddTimelineEntry() {
    if (!selectedTracking || !newTimelineEntry.stage || !newTimelineEntry.date) return

    try {
      const response = await fetch('/api/admin/track/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedTracking.productId,
          stage: newTimelineEntry.stage,
          date: newTimelineEntry.date,
          details: newTimelineEntry.details,
          type: newTimelineEntry.type
        })
      })

      if (response.ok) {
        // Refresh timeline entries
        const timelineRes = await fetch(`/api/track/${selectedTracking.productId}`)
        const data = await timelineRes.json()
        if (timelineRes.ok && data.tracking?.product?.trackingTimeline) {
          setTimelineEntries(data.tracking.product.trackingTimeline)
        }
        // Reset form
        setNewTimelineEntry({ stage: '', date: '', details: '', type: 'RECEPTION' })
      } else {
        alert('Failed to add timeline entry')
      }
    } catch (error) {
      console.error('Error adding timeline entry:', error)
      alert('Failed to add timeline entry')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard/admin`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">QR Code Tracking Management</h1>
          <p className="text-muted-foreground">Generate and manage QR codes for product traceability</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate QR Code</DialogTitle>
              <DialogDescription>
                Select a product and optionally add a batch number to generate a traceability QR code.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Product Filters */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Product Filters</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      placeholder="Product name or SKU"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={filters.category || "all"} onValueChange={(value) => setFilters({...filters, category: value === "all" ? "" : value})}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        <SelectItem value="Raw Nuts">Raw Nuts</SelectItem>
                        <SelectItem value="Roasted Nuts">Roasted Nuts</SelectItem>
                        <SelectItem value="Nut Butters">Nut Butters</SelectItem>
                        <SelectItem value="Oils">Oils</SelectItem>
                        <SelectItem value="Herbs">Herbs</SelectItem>
                        <SelectItem value="Spices">Spices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="minPrice">Min Price (DH)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPrice">Max Price (DH)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', search: '' })}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

              {/* Product Selection */}
              <div>
                <Label htmlFor="product">Product ({filteredProducts.length} available)</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No products match your filters
                      </div>
                    ) : (
                      filteredProducts.filter(p => p.id).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.sku ? `(${product.sku})` : '(No SKU)'} - {product.price} DH
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredProducts.length === 0 && products.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Try clearing filters to see all available products
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="batch">Batch Number (Optional)</Label>
                <Input
                  id="batch"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., BATCH-2024-001"
                />
              </div>
              <Button onClick={handleGenerateQR} disabled={!selectedProduct || isGenerating} className="w-full">
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated QR Code Display */}
      {qrCodeDataUrl && trackingUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 border rounded-lg" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tracking URL:</p>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{trackingUrl}</p>
                <Button onClick={downloadQRCode} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracked Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Products</CardTitle>
          <CardDescription>
            Products with QR codes enabled for traceability
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trackingList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products have QR codes generated yet.</p>
              <p className="text-sm">Click "Generate QR Code" to start tracking products.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Tracking URL</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackingList.map((tracking) => (
                  <TableRow key={tracking.id}>
                    <TableCell className="font-medium">
                      {tracking.product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tracking.sku}</Badge>
                    </TableCell>
                    <TableCell>
                      {tracking.batchNumber || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/track/${tracking.sku}`}
                    </TableCell>
                    <TableCell>
                      {new Date(tracking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`https://emmyor.com/track/${tracking.sku}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenTimeline(tracking)}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Timeline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Timeline Dialog */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Production Timeline - {selectedTracking?.product.name}</DialogTitle>
            <DialogDescription>
              Manage the production lifecycle stages for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Timeline Entry Form */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Add Timeline Entry</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Input
                    id="stage"
                    value={newTimelineEntry.stage}
                    onChange={(e) => setNewTimelineEntry({...newTimelineEntry, stage: e.target.value})}
                    placeholder="e.g., Raw Material Reception"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimelineEntry.date}
                    onChange={(e) => setNewTimelineEntry({...newTimelineEntry, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newTimelineEntry.type} onValueChange={(value) => setNewTimelineEntry({...newTimelineEntry, type: value})}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEPTION">Reception</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="PACKAGING">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="details">Details (Optional)</Label>
                <Input
                  id="details"
                  value={newTimelineEntry.details}
                  onChange={(e) => setNewTimelineEntry({...newTimelineEntry, details: e.target.value})}
                  placeholder="Additional details about this stage"
                />
              </div>
              <Button onClick={handleAddTimelineEntry} className="w-full">
                Add Timeline Entry
              </Button>
            </div>

            {/* Existing Timeline */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Existing Timeline</h3>
              {timelineEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No timeline entries yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {timelineEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{entry.stage}</p>
                        <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline">{entry.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
