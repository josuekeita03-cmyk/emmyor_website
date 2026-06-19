"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import type { Locale } from "@/lib/i18n-config"

const translations = {
  ar: {
    placeholder: "أدخل رمز التتبع (مثال: 538X5Z)",
    trackButton: "تتبع المنتج",
    or: "أو",
    scanQr: "امسح رمز QR",
  },
  en: {
    placeholder: "Enter tracking code (e.g., 538X5Z)",
    trackButton: "Track Product",
    or: "or",
    scanQr: "Scan QR Code",
  },
}

export function TrackProductForm({ locale = "ar" }: { locale?: Locale }) {
  const [code, setCode] = useState("")
  const router = useRouter()
  const t = translations[locale]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code) {
      window.location.href = `https://emmyor.com/track/${code}`
    }
  }

  const handleQrScan = () => {
    // Redirect to the tracking page with scan mode
    window.location.href = `https://emmyor.com/track?scan=true`
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t.placeholder}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t.trackButton}
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t.or}</span>
        </div>
      </div>
      <Button variant="outline" size="lg" className="w-full bg-transparent" onClick={handleQrScan}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4"
        >
          <rect width="14" height="14" x="3" y="3" rx="2" />
          <path d="M7 7h.01" />
          <path d="M7 17h.01" />
          <path d="M17 7h.01" />
          <path d="M17 17h.01" />
        </svg>
        {t.scanQr}
      </Button>
    </div>
  )
}
