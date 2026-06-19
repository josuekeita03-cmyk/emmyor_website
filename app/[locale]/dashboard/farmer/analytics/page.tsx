import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ArrowLeft, TrendingUp, DollarSign, Package, Users } from "lucide-react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerAnalyticsPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container py-10">
      <DashboardHeader
        title="Analytics"
        description="View your business performance metrics"
        notifications={0}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="45,750 DH"
          description="This month"
          icon={DollarSign}
          trend={{ value: 15, label: "vs last month" }}
        />
        <StatsCard
          title="Total Sales"
          value="23"
          description="Orders completed"
          icon={Package}
          trend={{ value: 8, label: "vs last month" }}
        />
        <StatsCard
          title="Active Buyers"
          value="12"
          description="Regular customers"
          icon={Users}
          trend={{ value: 3, label: "vs last month" }}
        />
        <StatsCard
          title="Growth Rate"
          value="18%"
          description="Monthly growth"
          icon={TrendingUp}
          trend={{ value: 5, label: "vs last month" }}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Week</span>
              <span className="font-medium">12,450 DH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Week</span>
              <span className="font-medium">10,200 DH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-medium">45,750 DH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-medium">38,900 DH</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link href={`/${locale}/dashboard/farmer`} className="inline-flex items-center mt-4 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  )
}
