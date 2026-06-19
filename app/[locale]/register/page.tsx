import Link from "next/link"
import { RegistrationForm } from "@/components/auth/registration-form"
import type { Locale } from "@/lib/i18n-config"

export default function RegisterPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params

  return (
    <div className="container min-h-screen py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <RegistrationForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/${locale}/login`} className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
