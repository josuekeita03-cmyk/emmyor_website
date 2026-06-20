"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Check, X, Search, Download, MessageSquare } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminWhatsAppOrders({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, customerFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      params.append("status", "WHATSAPP_PENDING")
      if (customerFilter) params.append("search", customerFilter)
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching WhatsApp orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "PROCESSING"
        }),
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error("Error accepting WhatsApp order:", error)
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "CANCELLED"
        }),
      })

      if (response.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error("Error rejecting WhatsApp order:", error)
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus
        }),
      })

      if (response.ok) {
        await fetchOrders()
        setIsDetailDialogOpen(false)
      }
    } catch (error) {
      console.error("Error changing WhatsApp order status:", error)
    }
  }

  const handleExportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Email", "Total", "Status", "Payment Method", "Date"].join(","),
      ...orders.map(order => [
        order.id.substring(0, 8).toUpperCase(),
        order.user.fullName || "N/A",
        order.user.email,
        order.total,
        order.status,
        order.paymentMethod,
        new Date(order.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `whatsapp_orders_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WHATSAPP_PENDING": return "bg-orange-100 text-orange-800"
      case "PROCESSING": return "bg-blue-100 text-blue-800"
      case "SHIPPED": return "bg-purple-100 text-purple-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading WhatsApp orders...</div>
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
        title="WhatsApp Order Management"
        description="Manage orders received via WhatsApp"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>WhatsApp Orders ({orders.length})</CardTitle>
            <Button onClick={handleExportOrders} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by customer name or email..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="WHATSAPP_PENDING">WhatsApp Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No WhatsApp orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        {order.id.substring(0, 8).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>{order.user.fullName || "N/A"}</TableCell>
                    <TableCell>{order.user.email}</TableCell>
                    <TableCell>{order.total} DH</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                          title="View Details"
                        >
                          View
                        </Button>
                        {order.status === "WHATSAPP_PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcceptOrder(order.id)}
                              title="Confirm Order"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectOrder(order.id)}
                              title="Reject Order"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>WhatsApp Order Details</DialogTitle>
            <DialogDescription>
              Order {selectedOrder?.id?.substring(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.user.fullName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.user.phoneNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WHATSAPP_PENDING">WhatsApp Pending</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">{selectedOrder.total} DH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Order Items</p>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.orderItems?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.nameEn || "N/A"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price} DH</TableCell>
                          <TableCell>{(item.quantity * item.price).toFixed(2)} DH</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
