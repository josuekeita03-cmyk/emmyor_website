import type { Locale } from "@/lib/i18n-config"

const translations = {
  ar: {
    title: "عن EMMYOR",
    subtitle: "ربط المزارعين المغاربة بالأسواق العالمية",
    mission: "مهمتنا",
    missionText: "تمكين المزارعين المغاربة من الوصول المباشر إلى الأسواق الوطنية والدولية، مع توفير منتجات زراعية عالية الجودة للمستهلكين في جميع أنحاء العالم.",
    vision: "رؤيتنا",
    visionText: "أن نكون المنصة الرائدة للتجارة الزراعية في المغرب وشمال إفريقيا، مع التركيز على الاستدامة والجودة والشفافية.",
    values: "قيمنا",
    valuesList: [
      "الجودة: نلتزم بأعلى معايير الجودة في جميع منتجاتنا",
      "الاستدامة: ندعم الممارسات الزراعية المستدامة والصديقة للبيئة",
      "الشفافية: نقدم تتبعًا كاملاً لجميع منتجاتنا من المزرعة إلى المستهلك",
      "التمكين: نساعد المزارعين الصغار على النمو والازدهار",
    ],
    story: "قصتنا",
    storyText: "تأسست منصة إمور بهدف تسهيل وصول المزارعين المغاربة إلى الأسواق العالمية. لاحظنا أن العديد من المزارعين المنتجين يواجهون صعوبات في الوصول إلى الأسواق بشكل عادل، بينما يبحث المستهلكون عن منتجات زراعية عالية الجودة وموثوقة. لذلك، قررنا إنشاء منصة تربط بين هاتين المجموعتين مع ضمان الجودة والشفافية والاستدامة.",
    impact: "تأثيرنا",
    impactList: [
      "دعم أكثر من 500 مزارع عبر المغرب",
      "توفير منتجات عالية الجودة لآلاف العملاء",
      "تقليل الهدر الغذائي من خلال تحسين سلاسل التوريد",
      "تعزيز الممارسات الزراعية المستدامة",
    ],
    contact: "تواصل معنا",
    contactText: "هل لديك أسئلة أو تريد معرفة المزيد عن EMMYOR؟ لا تتردد في التواصل معنا.",
  },
  en: {
    title: "About EMMYOR",
    subtitle: "Connecting Moroccan Farmers to Global Markets",
    mission: "Our Mission",
    missionText: "To empower Moroccan farmers with direct access to national and international markets while providing premium agricultural products to consumers worldwide.",
    vision: "Our Vision",
    visionText: "To be the leading platform for agricultural trade in Morocco and North Africa, focusing on sustainability, quality, and transparency.",
    values: "Our Values",
    valuesList: [
      "Quality: We commit to the highest quality standards in all our products",
      "Sustainability: We support sustainable and environmentally friendly farming practices",
      "Transparency: We provide full traceability for all our products from farm to consumer",
      "Empowerment: We help small farmers grow and thrive",
    ],
    story: "Our Story",
    storyText: "EMMYOR was founded with the goal of bridging the gap between Moroccan farmers and global markets. We noticed that many hardworking farmers struggled to access markets fairly, while consumers sought high-quality, reliable agricultural products. We decided to create a platform that connects both sides while ensuring quality, transparency, and sustainability.",
    impact: "Our Impact",
    impactList: [
      "Supporting over 500 farmers across Morocco",
      "Providing high-quality products to thousands of customers",
      "Reducing food waste through improved supply chains",
      "Promoting sustainable farming practices",
    ],
    contact: "Contact Us",
    contactText: "Have questions or want to learn more about EMMYOR? Don't hesitate to reach out to us.",
  },
}

export default function AboutPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params
  const isArabic = locale === "ar"
  const t = isArabic ? translations.ar : translations.en

  return (
    <div className="container py-12 md:py-24">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background p-8 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-400">{t.mission}</h2>
            <p className="text-muted-foreground">{t.missionText}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background p-8 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">{t.vision}</h2>
            <p className="text-muted-foreground">{t.visionText}</p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t.values}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.valuesList.map((value, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-card rounded-lg border">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-700 dark:text-green-400 font-bold">{index + 1}</span>
                </div>
                <p className="text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t.story}</h2>
          <div className="bg-card p-8 rounded-lg border">
            <p className="text-muted-foreground text-lg leading-relaxed">{t.storyText}</p>
          </div>
        </div>

        {/* Impact */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t.impact}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.impactList.map((impact, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-white dark:from-green-950 dark:to-background rounded-lg border">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-muted-foreground font-medium">{impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-to-r from-green-600 to-green-700 p-8 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-4">{t.contact}</h2>
          <p className="mb-6 text-green-100">{t.contactText}</p>
          <a
            href={`mailto:info@emmyor.com`}
            className="inline-block bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            info@emmyor.com
          </a>
        </div>
      </div>
    </div>
  )
}
