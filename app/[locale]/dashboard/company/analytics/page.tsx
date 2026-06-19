"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Package, DollarSign, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function CompanyAnalytics({ params }: { params: { locale: Locale } }) {
  const { data: session } = useSession()
  const { locale } = params
  const [loading, setLoading] = useState(true)

  // Mock data for analytics
  const monthlyData = [
    { month: "Jan", orders: 12, amount: 15000 },
    { month: "Feb", orders: 19, amount: 23000 },
    { month: "Mar", orders: 15, amount: 18000 },
    { month: "Apr", orders: 25, amount: 32000 },
    { month: "May", orders: 22, amount: 28000 },
    { month: "Jun", orders: 30, amount: 38000 },
  ]

  const serviceTypeData = [
    { name: "Packaging", value: 35 },
    { name: "ONSSA Certification", value: 25 },
    { name: "Automation", value: 20 },
    { name: "Machinery", value: 15 },
    { name: "Other", value: 5 },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <DashboardHeader
        title={`Welcome back, ${(session?.user as any)?.fullName || session?.user?.name || "Company"}`}
        description="View your B2B analytics and performance metrics"
        notifications={0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Orders"
          value="123"
          description="This year"
          icon={Package}
        />
        <StatsCard
          title="Total Spent"
          value="154,000 DH"
          description="This year"
          icon={DollarSign}
        />
        <StatsCard
          title="Consultations"
          value="8"
          description="Active"
          icon={FileText}
        />
        <StatsCard
          title="Growth Rate"
          value="+23%"
          description="vs last year"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Amount (DH)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" name="Percentage" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
