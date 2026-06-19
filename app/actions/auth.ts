"use server"

import { createUser, verifyUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function register(data: {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  city?: string
  role?: string
}) {
  try {
    const user = await createUser(data)

    // Redirect to the appropriate dashboard based on role
    const dashboardRoutes: Record<string, string> = {
      CUSTOMER: "/dashboard/customer",
      FARMER: "/dashboard/farmer",
      COOPERATIVE: "/dashboard/cooperative",
      COMPANY: "/dashboard/company",
      INDIVIDUAL_PRODUCER: "/dashboard/individual-producer",
      RETAILER: "/dashboard/retailer",
      COMMERCIAL: "/dashboard/commercial",
    }

    redirect(dashboardRoutes[user.role])
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Something went wrong" }
  }
}

export async function login(data: { email: string; password: string }) {
  try {
    const user = await verifyUser(data.email, data.password)
    if (!user) {
      return { error: "Invalid email or password" }
    }

    if (!user.isActive) {
      return { error: "Your account is currently inactive. Please contact support for assistance." }
    }

    // Redirect to the appropriate dashboard based on role
    const dashboardRoutes: Record<string, string> = {
      CUSTOMER: "/dashboard/customer",
      FARMER: "/dashboard/farmer",
      COOPERATIVE: "/dashboard/cooperative",
      COMPANY: "/dashboard/company",
      INDIVIDUAL_PRODUCER: "/dashboard/individual-producer",
      RETAILER: "/dashboard/retailer",
      COMMERCIAL: "/dashboard/commercial",
    }

    redirect(dashboardRoutes[user.role])
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Something went wrong" }
  }
}
