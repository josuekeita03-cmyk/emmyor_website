import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"
import { PasswordResetForm } from "@/components/auth/password-reset-form"
import type { Locale } from "@/lib/i18n-config"

export default function ForgotPasswordPage({ params }: { params: { locale: Locale } }) {
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

        <PasswordResetForm />

        <div className="mt-6 text-center">
          <Button variant="link" className="p-0" asChild>
            <Link href={`/${locale}/login`}>Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
