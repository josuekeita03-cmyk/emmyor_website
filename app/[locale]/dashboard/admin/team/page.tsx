"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Mail, Shield, UserCheck, UserX, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminTeam({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [commercials, setCommercials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    fullName: "",
    email: "",
    department: ""
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
        setAddFormData({ fullName: "", email: "", department: "" })
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

  const handleToggleActive = async (commercial: any) => {
    try {
      const response = await fetch(`/api/admin/team/${commercial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !commercial.isActive }),
      })

      if (response.ok) {
        await fetchCommercials()
      }
    } catch (error) {
      console.error("Error toggling commercial status:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commercial user? This action cannot be undone.")) return
    
    try {
      const response = await fetch(`/api/admin/team/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCommercials()
      }
    } catch (error) {
      console.error("Error deleting commercial:", error)
    }
  }

  const filteredCommercials = commercials.filter(c =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <CardTitle>Commercial Staff</CardTitle>
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
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={addFormData.department} onValueChange={(value) => setAddFormData({ ...addFormData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
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
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommercials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No commercial staff found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommercials.map((commercial) => (
                    <TableRow key={commercial.id}>
                      <TableCell className="font-medium">{commercial.fullName}</TableCell>
                      <TableCell>{commercial.email}</TableCell>
                      <TableCell>{commercial.department}</TableCell>
                      <TableCell className="font-mono text-xs">{commercial.employeeId}</TableCell>
                      <TableCell>
                        <Badge variant={commercial.isActive ? "default" : "secondary"}>
                          {commercial.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(commercial)}
                          >
                            {commercial.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(commercial.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
