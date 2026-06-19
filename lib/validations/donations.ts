import { z } from "zod"

// Donation schema
export const donationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  currency: z.string().default("MAD"),
  farmerId: z.string().optional(),
  campaignId: z.string().optional(),
  message: z.string().optional(),
})

// Donation campaign schema
export const donationCampaignSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  goalAmount: z.number().min(1, "Goal amount must be at least 1"),
  endDate: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type DonationInput = z.infer<typeof donationSchema>
export type DonationCampaignInput = z.infer<typeof donationCampaignSchema>
