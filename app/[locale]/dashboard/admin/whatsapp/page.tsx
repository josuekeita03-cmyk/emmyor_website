"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Save, ExternalLink, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminWhatsApp({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [settings, setSettings] = useState({
    phoneNumber: "",
    isActive: true,
    messageTemplate: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testPhoneNumber, setTestPhoneNumber] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null)
  const [previewData, setPreviewData] = useState({
    orderId: "ORD-12345678",
    customerName: "John Doe",
    customerPhone: "+212656271147",
    customerAddress: "123 Main St, Casablanca",
    items: "• Almonds x2 = 100 DH\n• Argan Oil x1 = 150 DH",
    total: "250",
    customerNote: "Please deliver in the morning"
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/whatsapp")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching WhatsApp settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/whatsapp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setTestResult({ success: true, message: "Settings saved successfully!" })
        setTimeout(() => setTestResult(null), 3000)
      } else {
        const error = await response.json()
        setTestResult({ success: false, message: error.error || "Failed to save settings" })
      }
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error)
      setTestResult({ success: false, message: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testPhoneNumber || !testMessage) {
      setTestResult({ success: false, message: "Please enter phone number and message" })
      return
    }

    try {
      const response = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: testPhoneNumber,
          message: testMessage
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTestResult({ 
          success: true, 
          message: "Test message generated successfully!", 
          url: data.whatsappUrl 
        })
        window.open(data.whatsappUrl, "_blank")
      } else {
        setTestResult({ success: false, message: data.error || "Failed to generate test message" })
      }
    } catch (error) {
      console.error("Error testing WhatsApp:", error)
      setTestResult({ success: false, message: "Failed to generate test message" })
    }
  }

  const generatePreview = () => {
    let preview = settings.messageTemplate
    preview = preview.replace(/{orderId}/g, previewData.orderId)
    preview = preview.replace(/{customerName}/g, previewData.customerName)
    preview = preview.replace(/{customerPhone}/g, previewData.customerPhone)
    preview = preview.replace(/{customerAddress}/g, previewData.customerAddress)
    preview = preview.replace(/{items}/g, previewData.items)
    preview = preview.replace(/{total}/g, previewData.total)
    preview = preview.replace(/{customerNote}/g, previewData.customerNote)
    return preview
  }

  const validatePhoneNumber = (phone: string) => {
    return /^\+\d{10,15}$/.test(phone)
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading WhatsApp settings...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard/admin`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <DashboardHeader
        title="WhatsApp Configuration"
        description="Configure WhatsApp order notifications and message templates"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
              <Input
                id="phoneNumber"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                placeholder="+212656271147"
                className={validatePhoneNumber(settings.phoneNumber) ? "" : "border-red-500"}
              />
              {!validatePhoneNumber(settings.phoneNumber) && settings.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  Invalid format. Use international format: +212XXXXXXXXX
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Format: + followed by 10-15 digits (e.g., +212656271147)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Enable/disable WhatsApp order notifications
                </p>
              </div>
              <Switch
                id="isActive"
                checked={settings.isActive}
                onCheckedChange={(checked) => setSettings({ ...settings, isActive: checked })}
              />
            </div>

            <div>
              <Label htmlFor="messageTemplate">Message Template</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Available variables: {"{orderId}"}, {"{customerName}"}, {"{customerPhone}"}, {"{customerAddress}"}, {"{items}"}, {"{total}"}, {"{customerNote}"}
              </p>
              <Textarea
                id="messageTemplate"
                value={settings.messageTemplate}
                onChange={(e) => setSettings({ ...settings, messageTemplate: e.target.value })}
                placeholder="Enter message template..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>

            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview and Test */}
        <div className="space-y-6">
          {/* Message Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preview Data</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <Input
                      value={previewData.orderId}
                      onChange={(e) => setPreviewData({ ...previewData, orderId: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer Name:</span>
                    <Input
                      value={previewData.customerName}
                      onChange={(e) => setPreviewData({ ...previewData, customerName: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <Input
                      value={previewData.customerPhone}
                      onChange={(e) => setPreviewData({ ...previewData, customerPhone: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <Input
                      value={previewData.total}
                      onChange={(e) => setPreviewData({ ...previewData, total: e.target.value })}
                      className="h-8"
                    />
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Address:</span>
                  <Input
                    value={previewData.customerAddress}
                    onChange={(e) => setPreviewData({ ...previewData, customerAddress: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Items:</span>
                  <Textarea
                    value={previewData.items}
                    onChange={(e) => setPreviewData({ ...previewData, items: e.target.value })}
                    rows={2}
                    className="h-16 text-sm"
                  />
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <Input
                    value={previewData.customerNote}
                    onChange={(e) => setPreviewData({ ...previewData, customerNote: e.target.value })}
                    className="h-8"
                  />
                </div>
              </div>
              <div>
                <Label>Preview</Label>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {generatePreview()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test System */}
          <Card>
            <CardHeader>
              <CardTitle>Test System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testPhone">Test Phone Number</Label>
                <Input
                  id="testPhone"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+212656271147"
                  className={validatePhoneNumber(testPhoneNumber) ? "" : "border-red-500"}
                />
              </div>
              <div>
                <Label htmlFor="testMessage">Test Message</Label>
                <Textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  rows={3}
                />
              </div>
              <Button onClick={handleTest} className="w-full" variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Generate Test Message
              </Button>
              <p className="text-xs text-muted-foreground">
                This will open WhatsApp in a new tab with the test message
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
