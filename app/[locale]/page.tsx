import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Package, ShoppingCart, Tractor, Users, Heart, HandHeart } from "lucide-react"
import Image from "next/image"
import { TrackProductForm } from "@/components/track-product-form"
import type { Locale } from "@/lib/i18n-config"

const testimonials = {
  ar: [
    {
      quote: "غيرت EMMYOR طريقة اتصالي بالأسواق العالمية. جعلت منصتهم من السهل الوصول إلى عملاء جدد.",
      name: "فاطمة بنعلي",
      role: "مزارعة عضوية",
    },
    {
      quote: "جودة المنتجات وحلول التغليف التي توفرها EMMYOR ساعدتنا على توسيع أعمالنا بشكل كبير.",
      name: "حسن المنصوري",
      role: "عميل B2B",
    },
    {
      quote: "أحب أن أتمكن من تتبع منتجاتي إلى المصدر. يعطيني ثقة في ما أشتريه.",
      name: "أمينة تازي",
      role: "مستهلك",
    },
  ],
  en: [
    {
      quote:
        "EMMYOR has transformed how I connect with global markets. Their platform made it simple to reach new customers.",
      name: "Fatima Benali",
      role: "Organic Farmer",
    },
    {
      quote:
        "The quality of products and packaging solutions provided by EMMYOR has helped us scale our business significantly.",
      name: "Hassan El Mansouri",
      role: "B2B Client",
    },
    {
      quote: "I love being able to trace my products back to the source. It gives me confidence in what I'm buying.",
      name: "Amina Tazi",
      role: "Consumer",
    },
  ],
}

export default function Home({ params }: { params: { locale: Locale } }) {
  const locale = params.locale
  const isArabic = locale === "ar"
  const t = isArabic ? translations.ar : translations.en

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">{t.hero.title}</h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">{t.hero.description}</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                  <Link href={`/${locale}/shop`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t.hero.shopButton}
                  </Link>
                </Button>
                <Button asChild size="lg">
                  <Link href={`/${locale}/farmer-registration`}>
                    {t.hero.farmerButton}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Link href={`/${locale}/b2b`}>{t.hero.b2bButton}</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl w-full max-w-[600px]">
              <iframe
                src="https://www.youtube.com/embed/THhOzCjGvJY"
                title="EMMYOR promotional video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{t.features.title}</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                {t.features.description}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Tractor className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">{t.features.farmer.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.features.farmer.description}</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">{t.features.b2b.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.features.b2b.description}</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <ShoppingCart className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold">{t.features.consumer.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.features.consumer.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{t.testimonials.title}</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                {t.testimonials.description}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
            {(testimonials[locale as keyof typeof testimonials] || testimonials.en).map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-lg bg-white dark:bg-card"
              >
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.quote}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tracking Section */}
      <section id="track-product" className="w-full py-12 md:py-24 lg:py-32 bg-green-50/50 dark:bg-green-950/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{t.track.title}</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                {t.track.description}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <TrackProductForm locale={locale} />
              <p className="text-sm text-muted-foreground">{t.track.placeholder}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Heart className="h-6 w-6 fill-current" />
                <span className="text-lg font-medium">{isArabic ? "ادعم مزارعينا" : "Support Our Farmers"}</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t.donate.title}</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">{t.donate.description}</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href={`/${locale}/farmers/donate`}>
                    <HandHeart className="mr-2 h-5 w-5" />
                    {t.donate.button}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/${locale}/farmers/donate#learn-more`}>{t.donate.learnMore}</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto aspect-video overflow-hidden rounded-xl lg:aspect-square">
              <Image
                alt={isArabic ? "مزارعة مغربية تعرض المنتجات التقليدية" : "Moroccan farmer showing traditional produce"}
                className="object-cover w-full h-full"
                height={600}
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ShrW78w5UTdiIvbnTLfKmZcMVeKLq0.png"
                width={600}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">{t.cta.title}</h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                {t.cta.description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[600px]">
              <Button asChild size="lg" className="w-full">
                <Link href={`/${locale}/shop`}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t.cta.shop}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full bg-transparent">
                <Link href={`/${locale}/farmer-registration`}>
                  <Tractor className="mr-2 h-4 w-4" />
                  {t.cta.farmer}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full bg-transparent">
                <Link href={`/${locale}/b2b`}>
                  <Package className="mr-2 h-4 w-4" />
                  {t.cta.b2b}
                </Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link href={`/${locale}/contact?type=investor`}>
                  <Users className="mr-2 h-4 w-4" />
                  {t.cta.invest}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const translations = {
  ar: {
    hero: {
      title: "ربط المزارعين بالأسواق العالمية",
      description: "تمكين المزارعين بالوصول المباشر للسوق مع توفير منتجات زراعية عالية الجودة وحلول مبتكرة.",
      shopButton: "تسوق المنتجات المميزة",
      farmerButton: "انضم كمزارع",
      b2bButton: "شارك معنا (B2B)",
    },
    features: {
      title: "ميزاتنا الرئيسية",
      description: "اكتشف كيف تحول EMMYOR التجارة الزراعية بحلول مبتكرة",
      farmer: {
        title: "منصة المزارعين",
        description: "وصول مباشر للسوق والدعم للمزارعين الصغار",
      },
      b2b: {
        title: "خدمات B2B",
        description: "حلول شاملة للشركات تشمل التغليف والشهادات",
      },
      consumer: {
        title: "منتجات المستهلك",
        description: "منتجات زراعية عالية الجودة مع تتبع كامل",
      },
    },
    testimonials: {
      title: "موثوق من قبل الكثيرين",
      description: "اسمع من شركائنا والعملاء الراضين",
    },
    track: {
      title: "تتبع منتجك",
      description: "اكتشف القصة وراء منتجك والتحقق من أصالته",
      placeholder: "ابحث عن رمز التتبع على ملصق المنتج أو امسح رمز QR",
    },
    donate: {
      title: "تبرع لمزارعيك المفضلين",
      description:
        "أظهر تقديرك بدعم المزارعين الذين يجلبون لك منتجات طبيعية عالية الجودة. يساهم تبرعك في خلق سبل عيش مستدامة ومجتمعات أقوى.",
      button: "ادعم مزارعينا",
      learnMore: "تعرف على المزيد",
    },
    cta: {
      title: "اختر طريقك",
      description: "انضم إلى EMMYOR اليوم وكن جزءاً من الثورة الزراعية",
      shop: "تسوق المنتجات",
      farmer: "انضم كمزارع",
      b2b: "خدمات B2B",
      invest: "استثمر معنا",
    },
  },
  en: {
    hero: {
      title: "Connecting Farmers to Global Markets",
      description:
        "Empowering farmers with direct market access while providing premium agricultural products and innovative solutions.",
      shopButton: "Shop Premium Products",
      farmerButton: "Join as a Farmer",
      b2bButton: "Partner with Us (B2B)",
    },
    features: {
      title: "Our Key Features",
      description: "Discover how EMMYOR revolutionizes agricultural trade with innovative solutions",
      farmer: {
        title: "Farmer Platform",
        description: "Direct market access and support for small farmers",
      },
      b2b: {
        title: "B2B Services",
        description: "Comprehensive solutions for businesses including packaging and certification",
      },
      consumer: {
        title: "Consumer Products",
        description: "High-quality agricultural products with full traceability",
      },
    },
    testimonials: {
      title: "Trusted by Many",
      description: "Hear from our satisfied partners and customers",
    },
    track: {
      title: "Track Your Product",
      description: "Discover the story behind your product and verify its authenticity",
      placeholder: "Find the tracking code on your product label or scan the QR code",
    },
    donate: {
      title: "Donate to Your Loved Farmers",
      description:
        "Show your appreciation by supporting the farmers who bring you high-quality, natural products. Your contribution helps create sustainable livelihoods and stronger communities.",
      button: "Support Our Farmers",
      learnMore: "Learn More",
    },
    cta: {
      title: "Choose Your Path",
      description: "Join EMMYOR today and be part of the agricultural revolution",
      shop: "Shop Products",
      farmer: "Join as Farmer",
      b2b: "B2B Services",
      invest: "Invest With Us",
    },
  },
}
