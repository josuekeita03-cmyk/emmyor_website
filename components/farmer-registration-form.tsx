"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle } from "lucide-react"

const formSchema = z.object({
  registrationType: z.enum(["FARMER", "COOPERATIVE"]),
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  farmLocation: z.string().min(2, {
    message: "Farm location must be at least 2 characters.",
  }),
  experience: z.number().min(0).optional(),
  certifications: z.string().optional(),
  members: z.number().min(1).optional(),
  produceType: z.string({
    required_error: "Please select a type of produce.",
  }),
  quantity: z.string().min(1, {
    message: "Please enter the quantity available.",
  }),
  price: z.string().min(1, {
    message: "Please enter your price per unit.",
  }),
  additionalInfo: z.string().optional(),
})

export function FarmerRegistrationForm() {
  const [registrationType, setRegistrationType] = useState<"FARMER" | "COOPERATIVE">("FARMER")
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationType: "FARMER",
      fullName: "",
      email: "",
      phone: "",
      password: "",
      farmLocation: "",
      experience: 0,
      certifications: "",
      members: 1,
      produceType: "",
      quantity: "",
      price: "",
      additionalInfo: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitMessage(null)
    
    console.log("Submitting registration with values:", values)
    
    try {
      const response = await fetch('/api/farmers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        setSubmitMessage({ type: 'success', message: data.message || 'Registration submitted successfully!' })
        form.reset()
      } else {
        setSubmitMessage({ type: 'error', message: data.error || 'Registration failed' })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setSubmitMessage({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Registration Type Selection */}
        <FormField
          control={form.control}
          name="registrationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value)
                  setRegistrationType(value as "FARMER" | "COOPERATIVE")
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select registration type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FARMER">Individual Farmer</SelectItem>
                  <SelectItem value="COOPERATIVE">Cooperative (Group of Farmers)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormDescription>This will be your login email after approval</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+212XXXXXXXXX" {...field} />
                </FormControl>
                <FormDescription>Use international format: +212XXXXXXXXX</FormDescription>
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
                <FormDescription>Must be at least 8 characters. You'll use this to log in after approval.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Farm Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {registrationType === "FARMER" ? "Farm Information" : "Cooperative Information"}
          </h3>
          
          <FormField
            control={form.control}
            name="farmLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {registrationType === "FARMER" ? "Farm Location" : "Cooperative Location"}
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Agadir, Marrakech" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {registrationType === "FARMER" && (
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 5" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {registrationType === "COOPERATIVE" && (
            <FormField
              control={form.control}
              name="members"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Members</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 50" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="certifications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certifications (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Organic, ONSSA" {...field} />
                </FormControl>
                <FormDescription>Comma-separated list of certifications</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Product Information</h3>
          
          <FormField
            control={form.control}
            name="produceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Produce</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main produce" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="peanuts">Peanuts</SelectItem>
                    <SelectItem value="almonds">Almonds</SelectItem>
                    <SelectItem value="argan">Argan Oil</SelectItem>
                    <SelectItem value="saffron">Saffron</SelectItem>
                    <SelectItem value="olives">Olives</SelectItem>
                    <SelectItem value="dates">Dates</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Available</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1000" {...field} />
                  </FormControl>
                  <FormDescription>Enter amount in kg or liters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Unit</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25.50" {...field} />
                  </FormControl>
                  <FormDescription>Price in DH per kg/liter</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Additional Information */}
        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details about your produce or farming practices"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </Button>

        {submitMessage && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            submitMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {submitMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{submitMessage.message}</span>
          </div>
        )}

        {submitMessage?.type === 'success' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your application will be reviewed by our team</li>
              <li>• You will receive an email with approval status</li>
              <li>• Once approved, you can log in with your credentials</li>
              <li>• Then you can access the farmer dashboard</li>
            </ul>
          </div>
        )}
      </form>
    </Form>
  )
}
