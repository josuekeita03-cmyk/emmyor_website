export const i18n = {
  defaultLocale: "ar" as const,
  locales: ["ar", "en"] as const,
}

export type Locale = (typeof i18n.locales)[number]
