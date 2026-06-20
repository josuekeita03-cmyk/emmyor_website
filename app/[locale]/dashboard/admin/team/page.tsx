"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminTeam({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [commercials, setCommercials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    fullName: "",
    email: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchCommercials()
  }, [])

  const fetchCommercials = async () => {
    try {
      const response = await fetch("/api/admin/team")
      const data = await response.json()
      setCommercials(data.commercials || [])
    } catch (error) {
      console.error("Error fetching commercials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCommercial = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFormData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: `Commercial user created successfully. Email sent to ${addFormData.email}` })
        setAddFormData({ fullName: "", email: "" })
        await fetchCommercials()
        setTimeout(() => setIsAddDialogOpen(false), 2000)
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to create commercial user" })
      }
    } catch (error) {
      console.error("Error creating commercial:", error)
      setMessage({ type: 'error', text: "Network error. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href={`/${locale}/dashboard/admin`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <DashboardHeader
        title="Team Management"
        description="Manage EMMYOR commercial staff members"
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Commercial Staff ({commercials.length})</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Commercial
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Commercial Staff</DialogTitle>
                  <DialogDescription>
                    Enter the commercial staff member's details. The system will generate a password and send it via email.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCommercial} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={addFormData.fullName}
                      onChange={(e) => setAddFormData({ ...addFormData, fullName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={addFormData.email}
                      onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                      placeholder="john@emmyor.com"
                      required
                    />
                  </div>
                  {message && (
                    <div className={`text-sm p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message.text}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Commercial"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commercials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No commercial staff found
                  </TableCell>
                </TableRow>
              ) : (
                commercials.map((commercial) => (
                  <TableRow key={commercial.id}>
                    <TableCell className="font-medium">{commercial.user.fullName}</TableCell>
                    <TableCell>{commercial.user.email}</TableCell>
                    <TableCell className="font-mono text-xs">{commercial.employeeId}</TableCell>
                    <TableCell>
                      <Badge variant={commercial.user.isActive ? "default" : "secondary"}>
                        {commercial.user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
