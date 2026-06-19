"use client"

import type React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Leaf,
  Nut,
  Cookie,
  BeanOff as PeanutOff,
  Droplet,
  Flower2,
  Speaker as Pepper,
  Search,
  QrCode,
  Package,
  ShoppingCart,
  User,
  LogOut,
} from "lucide-react"
import type { Locale } from "@/lib/i18n-config"
import { LanguageSwitcher } from "@/components/language-switcher"

const translations = {
  ar: {
    forFarmers: "للمزارعين",
    joinNetwork: "انضم إلى شبكتنا",
    joinNetworkDesc: "تواصل مباشرة مع الأسواق العالمية واحصل على دعم لعملك الزراعي",
    register: "التسجيل",
    registerDesc: "أنشئ حساب المزارع الخاص بك وابدأ في إدراج منتجاتك",
    dashboard: "لوحة التحكم",
    dashboardDesc: "إدارة قوائمك وتتبع مبيعاتك",
    resources: "الموارد",
    resourcesDesc: "الوصول إلى أدلة الزراعة وأفضل الممارسات",
    b2bServices: "خدمات B2B",
    packaging: "حلول التغليف",
    packagingDesc: "تصميم التغليف المخصص وخدمات الملء",
    certification: "الشهادات",
    certificationDesc: "الحصول على المساعدة في شهادات ONSSA",
    machines: "آلات EMMYOR",
    machinesDesc: "استكشف مجموعتنا من معدات المعالجة",
    tracking: "التتبع",
    trackingDesc: "حلول تتبع متقدمة لمنتجاتك",
    shop: "المتجر",
    rawNuts: "المكسرات الخام",
    rawNutsDesc: "الفول السوداني والمكاديميا واللوز والفستق الممتاز",
    roastedNuts: "المكسرات المحمصة",
    roastedNutsDesc: "المكسرات المحمصة حديثاً بالوصفات التقليدية",
    nutButters: "زبدة المكسرات",
    nutButtersDesc: "زبدة المكسرات الطبيعية والأملو التقليدي",
    oils: "الزيوت",
    oilsDesc: "زيت الأرغان النقي وزيت الزيتون والزيوت الطبيعية",
    herbs: "الأعشاب",
    herbsDesc: "الأعشاب الطازجة والمجففة المحلية",
    spices: "التوابل",
    spicesDesc: "التوابل المغربية الممتازة والزعفران",
    honey: "العسل",
    honeyDesc: "العسل المغربي النقي والطبيعي بأنواعه",
    bulk: "الطلبات الكبيرة",
    bulkDesc: "أسعار خاصة للمبيعات بالجملة والطلبات الكبيرة",
    about: "حول",
    search: "البحث عن المنتجات",
    scanProduct: "امسح المنتج",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
  },
  en: {
    forFarmers: "For Farmers",
    joinNetwork: "Join Our Network",
    joinNetworkDesc: "Connect directly with global markets and get support for your farming business",
    register: "Register",
    registerDesc: "Create your farmer account and start listing your products",
    dashboard: "Dashboard",
    dashboardDesc: "Manage your listings and track your sales",
    resources: "Resources",
    resourcesDesc: "Access farming guides and best practices",
    b2bServices: "B2B Services",
    packaging: "Packaging Solutions",
    packagingDesc: "Custom packaging design and filling services",
    certification: "Certification",
    certificationDesc: "Get assistance with ONSSA certifications",
    machines: "EMMYOR Machines",
    machinesDesc: "Explore our range of processing equipment",
    tracking: "Trackability",
    trackingDesc: "Advanced tracking solutions for your products",
    shop: "Shop",
    rawNuts: "Raw Nuts",
    rawNutsDesc: "Premium peanuts, almonds, cashews, and pistachios",
    roastedNuts: "Roasted Nuts",
    roastedNutsDesc: "Freshly roasted nuts with traditional recipes",
    nutButters: "Nut Butters",
    nutButtersDesc: "Natural nut butters and traditional Amlou",
    oils: "Oils",
    oilsDesc: "Pure argan oil, olive oil, and natural oils",
    herbs: "Herbs",
    herbsDesc: "Fresh and dried local herbs",
    spices: "Spices",
    spicesDesc: "Premium Moroccan spices and saffron",
    honey: "Honey",
    honeyDesc: "Pure and natural Moroccan honey varieties",
    bulk: "Bulk Orders",
    bulkDesc: "Special pricing for wholesale and bulk purchases",
    about: "About",
    search: "Search products",
    scanProduct: "Scan Product",
    signIn: "Sign In",
    signUp: "Sign Up",
  },
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const { data: session, status } = useSession()
  const isArabic = locale === "ar"
  const t = translations[locale]
  
  const userRole = session?.user?.role
  const canBrowseShop = ["CUSTOMER", "FARMER", "COMPANY", "COMMERCIAL", "ADMIN"].includes(userRole || "")
  const canUseCart = ["CUSTOMER", "ADMIN"].includes(userRole || "")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Leaf className="h-6 w-6" />
            <span className="inline-block font-bold">EMMYOR</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t.forFarmers}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-50 to-white p-6 no-underline outline-none focus:shadow-md dark:from-green-900 dark:to-background"
                          href={`/${locale}/farmers`}
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">{t.joinNetwork}</div>
                          <p className="text-sm leading-tight text-muted-foreground">{t.joinNetworkDesc}</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href={`/${locale}/farmer-registration`} title={t.register}>
                      {t.registerDesc}
                    </ListItem>
                    <ListItem href={`/${locale}/farmers/dashboard`} title={t.dashboard}>
                      {t.dashboardDesc}
                    </ListItem>
                    <ListItem href={`/${locale}/farmers/resources`} title={t.resources}>
                      {t.resourcesDesc}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t.b2bServices}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href={`/${locale}/b2b/packaging`} title={t.packaging}>
                      {t.packagingDesc}
                    </ListItem>
                    <ListItem href={`/${locale}/b2b/certification`} title={t.certification}>
                      {t.certificationDesc}
                    </ListItem>
                    <ListItem href={`/${locale}/b2b/machines`} title={t.machines}>
                      {t.machinesDesc}
                    </ListItem>
                    <ListItem href={`/${locale}/b2b/tracking`} title={t.tracking}>
                      {t.trackingDesc}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {canBrowseShop && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t.shop}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem href={`/${locale}/shop?category=Raw Nuts`} title={t.rawNuts} icon={<Nut className="h-4 w-4" />}>
                        {t.rawNutsDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Roasted Nuts`} title={t.roastedNuts} icon={<Cookie className="h-4 w-4" />}>
                        {t.roastedNutsDesc}
                      </ListItem>
                      <ListItem
                        href={`/${locale}/shop?category=Nut Butters`}
                        title={t.nutButters}
                        icon={<PeanutOff className="h-4 w-4" />}
                      >
                        {t.nutButtersDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Oils`} title={t.oils} icon={<Droplet className="h-4 w-4" />}>
                        {t.oilsDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Herbs`} title={t.herbs} icon={<Flower2 className="h-4 w-4" />}>
                        {t.herbsDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Spices`} title={t.spices} icon={<Pepper className="h-4 w-4" />}>
                        {t.spicesDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Honey`} title={t.honey} icon={<Droplet className="h-4 w-4" />}>
                        {t.honeyDesc}
                      </ListItem>
                      <ListItem href={`/${locale}/shop?category=Bulk Orders`} title={t.bulk} icon={<Package className="h-4 w-4" />}>
                        {t.bulkDesc}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem>
                <Link href={`/${locale}/about`} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>{t.about}</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" className="mr-2" aria-label={t.search}>
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" asChild className="mr-2" aria-label={t.scanProduct}>
            <Link href={`/${locale}/track`} className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              <span className="hidden sm:inline">{t.scanProduct}</span>
            </Link>
          </Button>
          <LanguageSwitcher currentLocale={locale} />
          <nav className="flex items-center space-x-2">
            {status === "loading" ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : session ? (
              <>
                {canUseCart && (
                  <Button variant="ghost" asChild>
                    <Link href={`/${locale}/cart`} className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden sm:inline">Cart</span>
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{(session.user as any)?.fullName || session.user?.name || "Dashboard"}</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/api/auth/signout`} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href={`/${locale}/login`}>{t.signIn}</Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale}/register`}>{t.signUp}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  icon,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
  icon?: React.ReactNode
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium leading-none">{title}</span>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

function navigationMenuTriggerStyle(): string {
  return "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
}
