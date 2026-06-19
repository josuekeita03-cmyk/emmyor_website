"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QrCodeDisplayProps {
  productId: string
}

export function QrCodeDisplay({ productId }: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code for the product URL
      QRCode.toCanvas(canvasRef.current, `https://track.emmyor.com/qr/${productId}`, {
        width: 300,
        margin: 2,
        color: {
          dark: "#16a34a", // Green color for the QR code
          light: "#ffffff",
        },
      })
    }
  }, [productId])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="border-4 border-white shadow-lg rounded-lg" />
      <p className="mt-4 text-sm text-center text-muted-foreground">Scan to verify authenticity</p>
    </div>
  )
}
