"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

const baseFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["CUSTOMER", "COMPANY", "INDIVIDUAL_PRODUCER", "RETAILER"]),
  trackingConsent: z.boolean().default(false),
})

const companySchema = baseFormSchema.extend({
  role: z.literal("COMPANY"),
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  size: z.string().optional(),
})

const individualProducerSchema = baseFormSchema.extend({
  role: z.literal("INDIVIDUAL_PRODUCER"),
  brandName: z.string().min(2, "Brand name is required"),
})

const retailerSchema = baseFormSchema.extend({
  role: z.literal("RETAILER"),
  storeName: z.string().min(2, "Store name is required"),
  location: z.string().min(2, "Location is required"),
})

const customerSchema = baseFormSchema.extend({
  role: z.literal("CUSTOMER"),
})

const registrationSchema = z.discriminatedUnion("role", [
  customerSchema,
  companySchema,
  individualProducerSchema,
  retailerSchema,
])

type RegistrationFormData = z.infer<typeof registrationSchema>

export function RegistrationForm() {
  const { register, isLoading, error } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string>("CUSTOMER")
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      city: "",
      role: "CUSTOMER",
      trackingConsent: false,
    } as RegistrationFormData,
  })

  const watchedRole = form.watch("role")

  async function onSubmit(values: RegistrationFormData) {
    const result = await register(values)
    if (result.success) {
      form.reset()
    }
  }

  const renderRoleSpecificFields = () => {
    switch (watchedRole) {
      case "COMPANY":
        return (
          <>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Food Processing, Retail" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="small">Small (1-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                      <SelectItem value="large">Large (251+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      case "INDIVIDUAL_PRODUCER":
        return (
          <FormField
            control={form.control}
            name="brandName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "RETAILER":
        return (
          <>
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Casablanca, Rabat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Join EMMYOR to connect with Moroccan agricultural products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I want to register as</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedRole(value)
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">Customer - Buy products</SelectItem>
                      <SelectItem value="COMPANY">Company - B2B partnerships</SelectItem>
                      <SelectItem value="INDIVIDUAL_PRODUCER">Individual Producer - Process products</SelectItem>
                      <SelectItem value="RETAILER">Retailer - Resell products</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Base Fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+212..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Casablanca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            <div className="space-y-4">
              {renderRoleSpecificFields()}
            </div>

            {/* Tracking Consent */}
            <FormField
              control={form.control}
              name="trackingConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to tracking cookies for analytics
                    </FormLabel>
                    <FormDescription>
                      Help us improve your experience by allowing anonymous usage tracking
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
