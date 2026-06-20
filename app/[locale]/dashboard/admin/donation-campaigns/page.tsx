"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Target, Calendar, DollarSign, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

interface Campaign {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  status: string
  deadline?: string
  farmer: {
    user: {
      fullName: string
    }
  }
  createdAt: string
}

export default function DonationCampaignsPage({ params }: { params: { locale: Locale } }) {
  const { data: session } = useSession()
  const { locale } = params
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [farmers, setFarmers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    farmerId: "",
    title: "",
    targetAmount: "",
    deadline: "",
    description: "",
  })

  useEffect(() => {
    fetchCampaigns()
    fetchFarmers()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/donation-campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmers = async () => {
    try {
      const response = await fetch("/api/farmers")
      const data = await response.json()
      setFarmers(data.farmers || [])
    } catch (error) {
      console.error("Error fetching farmers:", error)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/donation-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
        }),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setFormData({
          farmerId: "",
          title: "",
          targetAmount: "",
          deadline: "",
          description: "",
        })
        fetchCampaigns()
      } else {
        alert("Failed to create campaign")
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert("Failed to create campaign")
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading campaigns...</div>
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
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Admin"}`}
        description="Manage donation campaigns"
        notifications={0}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Donation Campaigns
            </CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <form onSubmit={handleCreateCampaign} className="space-y-4 mb-6 p-4 border rounded-lg">
              <h3 className="font-semibold">Create New Campaign</h3>
              <div className="grid gap-2">
                <Label htmlFor="farmerId">Select Farmer</Label>
                <Select
                  value={formData.farmerId}
                  onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.user.fullName} - {farmer.farmLocation || "Location not specified"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Help Farmer Ahmed Buy New Equipment"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Target Amount (MAD)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="50000"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the campaign purpose..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Campaign</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No campaigns found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>{campaign.farmer.user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {campaign.currentAmount.toLocaleString()} MAD
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {campaign.targetAmount.toLocaleString()} MAD
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "No deadline"}
                    </TableCell>
                    <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
