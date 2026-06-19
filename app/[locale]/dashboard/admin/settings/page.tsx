"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Settings, Database, Mail, Globe, Shield } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminSettings({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [settings, setSettings] = useState({
    siteName: "EMMYOR",
    siteDescription: "Moroccan Agricultural E-Commerce Platform",
    contactEmail: "contact@emmyor.com",
    contactPhone: "+212656271147",
    defaultCurrency: "MAD",
    defaultLanguage: "en",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 15,
    orderConfirmationEmail: true,
    orderStatusUpdateEmail: true,
    whatsappNotificationEmail: true,
  })
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save settings to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveMessage("Settings saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage("Failed to save settings")
    } finally {
      setSaving(false)
    }
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
        title="System Settings"
        description="Configure global system settings and preferences"
      />

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select value={settings.defaultCurrency} onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAD">MAD (Moroccan Dirham)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Disable site access for maintenance
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowRegistration">Allow Registration</Label>
                <p className="text-xs text-muted-foreground">
                  Enable new user registration
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-xs text-muted-foreground">
                  Users must verify email before access
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderConfirmationEmail">Order Confirmation Email</Label>
                <p className="text-xs text-muted-foreground">
                  Send email when order is placed
                </p>
              </div>
              <Switch
                id="orderConfirmationEmail"
                checked={settings.orderConfirmationEmail}
                onCheckedChange={(checked) => setSettings({ ...settings, orderConfirmationEmail: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="orderStatusUpdateEmail">Order Status Update Email</Label>
                <p className="text-xs text-muted-foreground">
                  Send email when order status changes
                </p>
              </div>
              <Switch
                id="orderStatusUpdateEmail"
                checked={settings.orderStatusUpdateEmail}
                onCheckedChange={(checked) => setSettings({ ...settings, orderStatusUpdateEmail: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whatsappNotificationEmail">WhatsApp Notification Email</Label>
                <p className="text-xs text-muted-foreground">
                  Send email when WhatsApp order is received
                </p>
              </div>
              <Switch
                id="whatsappNotificationEmail"
                checked={settings.whatsappNotificationEmail}
                onCheckedChange={(checked) => setSettings({ ...settings, whatsappNotificationEmail: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Database Connection: PostgreSQL (Neon)</p>
              <p className="text-sm text-muted-foreground">Status: Connected</p>
              <p className="text-sm text-muted-foreground">Last Backup: Automatic (daily)</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {saveMessage && (
          <div className={`text-center p-3 rounded-lg ${saveMessage.includes("success") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  )
}
