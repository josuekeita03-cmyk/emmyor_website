"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, DollarSign, TrendingUp, Settings, ArrowRight, Package, AlertTriangle, Clock, UserCheck, QrCode, Users2, FileText, Target } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function AdminDashboard({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const { data: session } = useSession()
  const [statsData, setStatsData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [revenue, setRevenue] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch admin stats from new API endpoint
      const statsRes = await fetch("/api/admin/stats")
      const statsData = await statsRes.json()
      
      setStatsData(statsData)
      setUsers(statsData.recentUsers || [])
      setOrders(statsData.recentOrders || [])
      setRevenue(statsData.stats.totalRevenue || 0)
      setPendingApprovals(statsData.stats.pendingApprovals || 0)
      setLowStockCount(statsData.stats.lowStockProducts || 0)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <DashboardHeader
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Admin"}`}
        description="Full system administration and configuration"
        notifications={0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={statsData?.stats?.totalUsers?.toString() || "0"}
          description="All registered users"
          icon={Users}
        />
        <StatsCard
          title="Total Revenue"
          value={`${revenue.toFixed(0)} DH`}
          description="Platform revenue"
          icon={DollarSign}
        />
        <StatsCard title="Active Orders" value={statsData?.stats?.activeOrders?.toString() || "0"} description="Current orders" icon={Package} />
        <StatsCard
          title="Pending Approvals"
          value={pendingApprovals.toString()}
          description="Awaiting review"
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatsCard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          description="Stock below 10 units"
          icon={AlertTriangle}
        />
        <StatsCard
          title="System Health"
          value="100%"
          description="Uptime this month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users registered yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/admin/users`}>
                View all users
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email Service</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">OAuth Providers</span>
                <span className="text-sm font-medium text-green-600">Configured</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Storage</span>
                <span className="text-sm font-medium text-green-600">Normal</span>
              </div>
            </div>
            <Button variant="link" className="mt-4" asChild>
              <Link href={`/${locale}/dashboard/admin/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild>
              <Link href={`/${locale}/dashboard/admin/users`}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/products`}>Manage Products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/orders`}>View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/whatsapp`}>WhatsApp Config</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/farmer-registrations`}>
                <UserCheck className="mr-2 h-4 w-4" />
                Farmer Registrations
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4 mt-4">
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/donation-campaigns`}>
                <Target className="mr-2 h-4 w-4" />
                Donation Campaigns
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/b2b-consultations`}>
                <FileText className="mr-2 h-4 w-4" />
                B2B Consultations
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/qr-tracking`}>
                <QrCode className="mr-2 h-4 w-4" />
                QR Code Tracking
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/dashboard/admin/team`}>
                <Users2 className="mr-2 h-4 w-4" />
                Team Management
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
