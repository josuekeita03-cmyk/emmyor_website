"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'ar'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return { success: false, error: "Invalid email or password" }
      }

      // Redirect to dashboard without locale prefix - middleware will handle locale
      router.push("/dashboard")
      router.refresh()
      return { success: true }
    } catch (err) {
      setError("An error occurred during login")
      return { success: false, error: "An error occurred during login" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut({ redirect: false })
      router.push(`/${locale}`)
      router.refresh()
    } catch (err) {
      setError("An error occurred during logout")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed")
        return { success: false, error: data.error || "Registration failed" }
      }

      // Auto-login after registration
      await login(userData.email, userData.password)
      return { success: true }
    } catch (err) {
      setError("An error occurred during registration")
      return { success: false, error: "An error occurred during registration" }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { 
        callbackUrl: "/en/dashboard",
        redirect: true
      })
    } catch (err) {
      setError("Google login failed")
      setIsLoading(false)
    }
  }

  const loginWithFacebook = async () => {
    setIsLoading(true)
    try {
      await signIn("facebook", { 
        callbackUrl: "/en/dashboard",
        redirect: true
      })
    } catch (err) {
      setError("Facebook login failed")
      setIsLoading(false)
    }
  }

  const loginWithApple = async () => {
    setIsLoading(true)
    try {
      await signIn("apple", { 
        callbackUrl: "/en/dashboard",
        redirect: true
      })
    } catch (err) {
      setError("Apple login failed")
      setIsLoading(false)
    }
  }

  return {
    user: session?.user,
    session,
    status,
    isLoading,
    error,
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN" || session?.user?.role === "COMMERCIAL",
    login,
    logout,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
  }
}
