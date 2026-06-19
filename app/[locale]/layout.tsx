import type React from "react"
import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import { i18n, type Locale } from "@/lib/i18n-config"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params

  if (!i18n.locales.includes(localeParam as Locale)) {
    notFound()
  }

  const locale = localeParam as Locale
  const isArabic = locale === "ar"

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {isArabic ? "© 2025 EMMYOR. جميع الحقوق محفوظة." : "© 2025 EMMYOR. All rights reserved."}
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href={`/${locale}/terms`}>{isArabic ? "الشروط" : "Terms"}</Link>
            <Link href={`/${locale}/privacy`}>{isArabic ? "الخصوصية" : "Privacy"}</Link>
            <Link href={`/${locale}/contact`}>{isArabic ? "اتصل بنا" : "Contact"}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
