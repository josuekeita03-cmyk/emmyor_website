"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Shield, Smartphone, Cog, ArrowRight, CheckCircle2, Loader2, FileText } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Locale } from "@/lib/i18n-config"

export default function B2BPage({ params }: { params: { locale: Locale } }) {
  const { data: session } = useSession()
  const { locale } = params
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    serviceType: "",
    budget: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/b2b/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          serviceType: "",
          budget: "",
          message: "",
        })
      } else {
        alert(data.error || "Failed to submit consultation request")
      }
    } catch (error) {
      console.error("Error submitting consultation:", error)
      alert("Failed to submit consultation request")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Consultation Request Submitted!
            </CardTitle>
            <CardDescription>Our B2B team will contact you shortly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Thank you for your interest in our B2B services. Our team will review your request and get back to you within 24-48 hours.
            </p>
            <Button asChild>
              <a href={`/${locale}/dashboard/company`}>Return to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Partner with Us (B2B)</h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Your trusted partner for premium agricultural products, innovative solutions, and end-to-end supply
                chain management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Our Services</h2>
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <service.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
                      <ul className="mt-2 grid gap-1">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Why Choose EMMYOR?</h2>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{benefit.title}</CardTitle>
                      <CardDescription>{benefit.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Form Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tighter flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-green-600" />
                Request a Consultation
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Let us know how we can assist you with your business needs
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Consultation Request Form</CardTitle>
                <CardDescription>Fill out the form below and our team will contact you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+212 600 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Packaging">Packaging Custom Layouts</SelectItem>
                        <SelectItem value="ONSSA Certification">ONSSA Certification Processing</SelectItem>
                        <SelectItem value="Automation">Automation Pipelines</SelectItem>
                        <SelectItem value="Machinery">Machinery Procurement</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="budget">Budget (MAD) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Request
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter">Get in Touch</h2>
            <p className="text-gray-500 dark:text-gray-400">Our B2B team is ready to help you grow your business</p>
            <div className="space-y-2">
              <p>Email: b2b@emmyor.com</p>
              <p>Phone: +212 987 654 321</p>
            </div>
            <Button size="lg" className="mt-4">
              Schedule a Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const services = [
  {
    icon: Package,
    title: "Packaging Custom Layouts",
    description: "Custom packaging solutions tailored to your specifications",
    features: ["Custom packaging design", "Label design and printing", "Filling services", "Quality control"],
  },
  {
    icon: Shield,
    title: "ONSSA Certification Processing",
    description: "Expert guidance for obtaining necessary certifications",
    features: [
      "ONSSA certification support",
      "International standards compliance",
      "Documentation assistance",
      "Quality assurance",
    ],
  },
  {
    icon: Smartphone,
    title: "Automation Pipelines",
    description: "Advanced tracking system for your products",
    features: ["Real-time tracking", "Supply chain visibility", "Mobile app access", "Analytics dashboard"],
  },
  {
    icon: Cog,
    title: "Machinery Procurement",
    description: "Access to advanced agricultural machinery",
    features: ["Processing equipment", "Packaging machines", "Maintenance support", "Technical training"],
  },
]

const benefits = [
  {
    title: "Transparent Supply Chain",
    description: "Complete visibility from farm to shelf with our advanced tracking system",
  },
  {
    title: "Sustainable Practices",
    description: "Environmentally conscious operations and eco-friendly packaging options",
  },
  {
    title: "Quality Assurance",
    description: "Rigorous quality control measures and certification compliance",
  },
  {
    title: "Competitive Pricing",
    description: "Fair and transparent pricing with flexible terms for businesses",
  },
]
