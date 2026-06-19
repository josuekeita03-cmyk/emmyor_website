import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import type { Locale } from "@/lib/i18n-config"

export default async function DashboardPage({ params }: { params: { locale: Locale } }) {
  const user = await getCurrentUser()
  const { locale } = params
  
  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case "CUSTOMER":
      redirect(`/${locale}/dashboard/customer`)
    case "FARMER":
      redirect(`/${locale}/dashboard/farmer`)
    case "COOPERATIVE":
      redirect(`/${locale}/dashboard/cooperative`)
    case "COMPANY":
      redirect(`/${locale}/dashboard/company`)
    case "INDIVIDUAL_PRODUCER":
      redirect(`/${locale}/dashboard/individual-producer`)
    case "RETAILER":
      redirect(`/${locale}/dashboard/retailer`)
    case "COMMERCIAL":
      redirect(`/${locale}/dashboard/commercial`)
    case "ADMIN":
      redirect(`/${locale}/dashboard/admin`)
    default:
      redirect(`/${locale}/dashboard/customer`)
  }
}
