"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, TrendingUp, DollarSign, Package, Users, Calendar } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function AdminReports({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const [reportType, setReportType] = useState("sales")
  const [dateRange, setDateRange] = useState("30")
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    fetchReportData()
  }, [reportType, dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Mock data for now - in production, fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReportData({
        sales: {
          totalRevenue: 45000,
          totalOrders: 150,
          averageOrderValue: 300,
          topProducts: [
            { name: "Argan Oil", sales: 12000, orders: 40 },
            { name: "Almonds", sales: 8000, orders: 35 },
            { name: "Amlou", sales: 6000, orders: 25 },
          ]
        },
        users: {
          totalUsers: 250,
          newUsers: 45,
          activeUsers: 180,
          byRole: [
            { role: "CUSTOMER", count: 150 },
            { role: "FARMER", count: 50 },
            { role: "COMPANY", count: 30 },
            { role: "COOPERATIVE", count: 20 },
          ]
        },
        products: {
          totalProducts: 80,
          lowStock: 12,
          outOfStock: 5,
          topSelling: [
            { name: "Argan Oil", sold: 150 },
            { name: "Almonds", sold: 120 },
            { name: "Amlou", sold: 90 },
          ]
        },
        orders: {
          totalOrders: 150,
          pending: 25,
          processing: 45,
          shipped: 50,
          delivered: 25,
          cancelled: 5,
        }
      })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = () => {
    // Export to Excel format
    const data = reportData?.[reportType]
    if (!data) return

    let content = ""
    let filename = ""

    if (reportType === "sales") {
      filename = `sales_report_${new Date().toISOString().split("T")[0]}.xls`
      content = "Product\tSales (DH)\tOrders\n"
      data.topProducts.forEach((item: any) => {
        content += `${item.name}\t${item.sales}\t${item.orders}\n`
      })
    } else if (reportType === "users") {
      filename = `users_report_${new Date().toISOString().split("T")[0]}.xls`
      content = "Role\tCount\n"
      data.byRole.forEach((item: any) => {
        content += `${item.role}\t${item.count}\n`
      })
    } else if (reportType === "products") {
      filename = `products_report_${new Date().toISOString().split("T")[0]}.xls`
      content = "Product\tSold\n"
      data.topSelling.forEach((item: any) => {
        content += `${item.name}\t${item.sold}\n`
      })
    } else if (reportType === "orders") {
      filename = `orders_report_${new Date().toISOString().split("T")[0]}.xls`
      content = "Status\tCount\n"
      content += `Pending\t${data.pending}\n`
      content += `Processing\t${data.processing}\n`
      content += `Shipped\t${data.shipped}\n`
      content += `Delivered\t${data.delivered}\n`
      content += `Cancelled\t${data.cancelled}\n`
    }

    const blob = new Blob([content], { type: "application/vnd.ms-excel" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading reports...</div>
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
        title="Reports & Analytics"
        description="View detailed reports and export data"
      />

      <div className="grid gap-4 mb-6">
        <div className="flex gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="users">Users Report</SelectItem>
              <SelectItem value="products">Products Report</SelectItem>
              <SelectItem value="orders">Orders Report</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        {reportType === "sales" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.sales.totalRevenue} DH</div>
                <p className="text-xs text-muted-foreground">+12.5% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.sales.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+8.2% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.sales.averageOrderValue} DH</div>
                <p className="text-xs text-muted-foreground">+3.1% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">+0.5% from last period</p>
              </CardContent>
            </Card>
          </>
        )}
        {reportType === "users" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.users.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+15% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.users.newUsers}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.users.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+2% from last period</p>
              </CardContent>
            </Card>
          </>
        )}
        {reportType === "products" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.products.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{reportData.products.lowStock}</div>
                <p className="text-xs text-muted-foreground">Below 10 units</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{reportData.products.outOfStock}</div>
                <p className="text-xs text-muted-foreground">Need restocking</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Added this period</p>
              </CardContent>
            </Card>
          </>
        )}
        {reportType === "orders" && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.orders.totalOrders}</div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{reportData.orders.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{reportData.orders.processing}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{reportData.orders.delivered}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === "sales" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sales (DH)</TableHead>
                  <TableHead>Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.sales.topProducts.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sales} DH</TableCell>
                    <TableCell>{item.orders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {reportType === "users" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.users.byRole.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.role}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{((item.count / reportData.users.totalUsers) * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {reportType === "products" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.products.topSelling.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sold}</TableCell>
                    <TableCell className="text-green-600">↑ {Math.floor(Math.random() * 20) + 5}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {reportType === "orders" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Pending</TableCell>
                  <TableCell>{reportData.orders.pending}</TableCell>
                  <TableCell>{((reportData.orders.pending / reportData.orders.totalOrders) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Processing</TableCell>
                  <TableCell>{reportData.orders.processing}</TableCell>
                  <TableCell>{((reportData.orders.processing / reportData.orders.totalOrders) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Shipped</TableCell>
                  <TableCell>{reportData.orders.shipped}</TableCell>
                  <TableCell>{((reportData.orders.shipped / reportData.orders.totalOrders) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Delivered</TableCell>
                  <TableCell>{reportData.orders.delivered}</TableCell>
                  <TableCell>{((reportData.orders.delivered / reportData.orders.totalOrders) * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cancelled</TableCell>
                  <TableCell>{reportData.orders.cancelled}</TableCell>
                  <TableCell>{((reportData.orders.cancelled / reportData.orders.totalOrders) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
