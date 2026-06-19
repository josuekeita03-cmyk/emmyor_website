"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, ArrowLeft, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminFarmerRegistrations({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/admin/farmer-registrations")
      const data = await res.json()
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error("Error fetching farmer registrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRegistration) return

    setProcessing(true)
    try {
      const res = await fetch("/api/admin/farmer-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          action: "approve"
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setIsApproveDialogOpen(false)
        setSelectedRegistration(null)
        fetchRegistrations()
      } else {
        alert(data.error || "Failed to approve registration")
      }
    } catch (error) {
      console.error("Error approving registration:", error)
      alert("Failed to approve registration")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRegistration) return

    setProcessing(true)
    try {
      const res = await fetch("/api/admin/farmer-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          action: "reject"
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message)
        setIsRejectDialogOpen(false)
        setSelectedRegistration(null)
        fetchRegistrations()
      } else {
        alert(data.error || "Failed to reject registration")
      }
    } catch (error) {
      console.error("Error rejecting registration:", error)
      alert("Failed to reject registration")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading farmer registrations...</div>
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
        title="Farmer Registrations"
        description="Review and approve pending farmer registration requests"
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Registrations ({registrations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending registrations</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farm Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.farmName}</TableCell>
                    <TableCell>{reg.userId}</TableCell>
                    <TableCell>{reg.location}</TableCell>
                    <TableCell>
                      {reg.products ? JSON.parse(reg.products).map((p: any) => p.type).join(", ") : "N/A"}
                    </TableCell>
                    <TableCell>{new Date(reg.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isApproveDialogOpen} onOpenChange={(open) => {
                          setIsApproveDialogOpen(open)
                          if (!open) {
                            setPassword("")
                            setSelectedRegistration(null)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedRegistration(reg)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Farmer Registration</DialogTitle>
                              <DialogDescription>
                                Approve {selectedRegistration?.farmName}'s registration and create a user account.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {selectedRegistration && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm"><strong>Farm:</strong> {selectedRegistration.farmName}</p>
                                  <p className="text-sm"><strong>Email:</strong> {selectedRegistration.userId}</p>
                                  <p className="text-sm"><strong>Location:</strong> {selectedRegistration.location}</p>
                                  <p className="text-sm"><strong>Products:</strong> {selectedRegistration.products ? JSON.parse(selectedRegistration.products).map((p: any) => `${p.type} (${p.quantity} ${p.price})`).join(", ") : "N/A"}</p>
                                </div>
                              )}
                              <Button onClick={handleApprove} disabled={processing} className="w-full">
                                {processing ? "Processing..." : "Approve & Create Account"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={isRejectDialogOpen} onOpenChange={(open) => {
                          setIsRejectDialogOpen(open)
                          if (!open) {
                            setSelectedRegistration(null)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedRegistration(reg)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Farmer Registration</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to reject {selectedRegistration?.farmName}'s registration?
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRegistration && (
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm"><strong>Farm:</strong> {selectedRegistration.farmName}</p>
                                  <p className="text-sm"><strong>Email:</strong> {selectedRegistration.userId}</p>
                                  <p className="text-sm"><strong>Location:</strong> {selectedRegistration.location}</p>
                                  <p className="text-sm"><strong>Products:</strong> {selectedRegistration.products ? JSON.parse(selectedRegistration.products).map((p: any) => `${p.type} (${p.quantity} ${p.price})`).join(", ") : "N/A"}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleReject} disabled={processing} variant="destructive" className="flex-1">
                                    {processing ? "Processing..." : "Confirm Rejection"}
                                  </Button>
                                  <Button 
                                    onClick={() => setIsRejectDialogOpen(false)} 
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
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
