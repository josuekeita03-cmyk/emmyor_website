import { z } from "zod"

// B2B consultation schema
export const b2bConsultationSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  serviceType: z.enum(["Packaging", "ONSSA Certification", "Automation", "Machinery", "Other"]),
  budget: z.string().optional(),
  message: z.string().optional(),
})

export type B2BConsultationInput = z.infer<typeof b2bConsultationSchema>
