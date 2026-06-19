import { i18n, type Locale } from "@/lib/i18n-config"

export function getLocalizedPath(locale: Locale, path: string): string {
  if (locale === i18n.defaultLocale) {
    return path
  }
  return `/${locale}${path}`
}

export function isValidLocale(locale: string): locale is Locale {
  return i18n.locales.includes(locale as Locale)
}
