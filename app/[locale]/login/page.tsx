import Link from "next/link"
import { Leaf } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import type { Locale } from "@/lib/i18n-config"

export default function LoginPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span>EMMYOR</span>
          </div>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <span className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/${locale}/register`} className="text-primary hover:underline">
              Sign up here
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}
