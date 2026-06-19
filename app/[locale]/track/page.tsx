"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Search, Camera, X } from "lucide-react"

export default function TrackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scanMode = searchParams.get('scan') === 'true'
  const [trackingCode, setTrackingCode] = useState("")
  const [isScanning, setIsScanning] = useState(scanMode)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    if (scanMode) {
      setIsScanning(true)
    }
  }, [scanMode])

  const handleSearch = () => {
    if (trackingCode.trim()) {
      window.location.href = `https://emmyor.com/track/${trackingCode.trim()}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleScan = () => {
    setIsScanning(true)
    setCameraError(null)
  }

  const handleScanResult = (decodedText: string) => {
    // Extract SKU from the QR code URL if it's a full URL
    let sku = decodedText
    if (decodedText.includes('emmyor.com/track/')) {
      sku = decodedText.split('/track/')[1]
    }
    setTrackingCode(sku)
    setIsScanning(false)
    window.location.href = `https://emmyor.com/track/${sku}`
  }

  const closeScanner = () => {
    setIsScanning(false)
    setCameraError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Track Your Product</CardTitle>
          <CardDescription>
            Enter your product tracking code or scan the QR code to see its journey from farm to table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Camera access required for QR scanning</p>
                  <p className="text-xs opacity-50 mt-2">Point your camera at a QR code</p>
                </div>
              </div>
              <Button onClick={closeScanner} variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Cancel Scan
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Note: For production, integrate a QR scanner library like html5-qrcode
              </p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="trackingCode">Tracking Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="trackingCode"
                    placeholder="Enter SKU or tracking code"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={!trackingCode.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button onClick={handleScan} variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Find the tracking code on your product packaging</p>
                <p className="mt-1">or scan the QR code label</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
