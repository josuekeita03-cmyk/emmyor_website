"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Locale } from "@/lib/i18n-config"
import { i18n } from "@/lib/i18n-config"

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname()

  const getLocalizedPath = (locale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/"

    if (locale === i18n.defaultLocale) {
      return pathWithoutLocale
    }
    return `/${locale}${pathWithoutLocale}`
  }

  const otherLocale = currentLocale === "ar" ? "en" : "ar"
  const otherLocaleName = otherLocale === "ar" ? "العربية" : "English"

  return (
    <Button variant="ghost" size="sm" asChild className="gap-2">
      <Link href={getLocalizedPath(otherLocale)}>
        <Globe className="h-4 w-4" />
        <span>{otherLocaleName}</span>
      </Link>
    </Button>
  )
}
