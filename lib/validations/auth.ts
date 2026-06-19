import { z } from "zod"

// Role enum matching the database schema
export const RoleEnum = z.enum([
  "CUSTOMER",
  "FARMER", 
  "COOPERATIVE",
  "COMPANY",
  "INDIVIDUAL_PRODUCER",
  "RETAILER",
  "COMMERCIAL",
  "ADMIN"
])

// Base user schema
export const userBaseSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
  role: RoleEnum.default("CUSTOMER"),
  trackingConsent: z.boolean().default(false),
})

// Customer registration schema
export const customerRegistrationSchema = userBaseSchema.extend({
  role: z.literal("CUSTOMER"),
})

// Farmer registration schema
export const farmerRegistrationSchema = userBaseSchema.extend({
  role: z.literal("FARMER"),
  farmLocation: z.string().min(2, "Farm location is required"),
  experience: z.number().min(0).optional(),
  certifications: z.string().optional(), // JSON string
})

// Cooperative registration schema
export const cooperativeRegistrationSchema = userBaseSchema.extend({
  role: z.literal("COOPERATIVE"),
  members: z.number().min(1, "Number of members is required"),
  location: z.string().min(2, "Location is required"),
  certifications: z.string().optional(), // JSON string
})

// Company registration schema
export const companyRegistrationSchema = userBaseSchema.extend({
  role: z.literal("COMPANY"),
  companyName: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  size: z.string().optional(),
})

// Individual producer registration schema
export const individualProducerRegistrationSchema = userBaseSchema.extend({
  role: z.literal("INDIVIDUAL_PRODUCER"),
  brandName: z.string().min(2, "Brand name is required"),
})

// Retailer registration schema
export const retailerRegistrationSchema = userBaseSchema.extend({
  role: z.literal("RETAILER"),
  storeName: z.string().min(2, "Store name is required"),
  location: z.string().min(2, "Location is required"),
})

// Commercial registration schema
export const commercialRegistrationSchema = userBaseSchema.extend({
  role: z.literal("COMMERCIAL"),
  department: z.string().min(2, "Department is required"),
  employeeId: z.string().min(2, "Employee ID is required"),
})

// Combined registration schema with role discrimination
export const registrationSchema = z.discriminatedUnion("role", [
  customerRegistrationSchema,
  farmerRegistrationSchema,
  cooperativeRegistrationSchema,
  companyRegistrationSchema,
  individualProducerRegistrationSchema,
  retailerRegistrationSchema,
  commercialRegistrationSchema,
])

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Token is required"),
})

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phoneNumber: z.string().optional(),
  city: z.string().optional(),
})

// Types
export type RegistrationInput = z.infer<typeof registrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
