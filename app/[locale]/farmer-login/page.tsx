import Link from "next/link"
import { Leaf } from "lucide-react"
import { FarmerLoginForm } from "@/components/auth/farmer-login-form"
import type { Locale } from "@/lib/i18n-config"

export default function FarmerLoginPage({ params, searchParams }: { params: { locale: Locale }, searchParams: { error?: string } }) {
  const { locale } = params
  const error = searchParams.error

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span>EMMYOR</span>
          </div>
          <p className="text-muted-foreground">Farmer Sign In</p>
        </div>

        {error === "not_farmer" && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            This login is for farmers only. Your account does not have farmer role. Please use the main login page.
          </div>
        )}

        <FarmerLoginForm locale={locale} initialError={error === "not_farmer" ? "This login is for farmers only. Your account does not have farmer role. Please use the main login page." : undefined} />

        <div className="mt-6 text-center space-y-2">
          <span className="text-sm text-muted-foreground">
            Not a farmer yet?{" "}
            <Link href={`/${locale}/farmer-registration`} className="text-primary hover:underline">
              Register as a farmer
            </Link>
          </span>
          <br />
          <span className="text-sm text-muted-foreground">
            Sign in as a different role?{" "}
            <Link href={`/${locale}/login`} className="text-primary hover:underline">
              Go to main login page
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
