import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import type { Locale } from "@/lib/i18n-config"
import { signOut } from "next-auth/react"

export default async function FarmerLoginVerifyPage({ params }: { params: { locale: Locale } }) {
  const user = await getCurrentUser()
  const { locale } = params

  if (!user) {
    redirect(`/${locale}/farmer-login`)
  }

  // Check if user has FARMER role only (not even ADMIN)
  if (user.role !== "FARMER") {
    // Sign out the user since they don't have the required role
    // This needs to be done client-side, so we'll redirect to a page that handles it
    redirect(`/${locale}/farmer-login?error=not_farmer`)
  }

  // User has the required role, redirect to dashboard
  redirect(`/${locale}/dashboard`)
}
