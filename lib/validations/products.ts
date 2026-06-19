import { z } from "zod"

// Product schema
export const productSchema = z.object({
  nameEn: z.string().min(2, "English name is required"),
  nameAr: z.string().min(2, "Arabic name is required"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  unit: z.string().optional(),
  origin: z.string().optional(),
  packaging: z.string().optional(),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  sku: z.string().optional(),
  stock: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  farmerId: z.string().optional(),
  producerId: z.string().optional(),
})

// Product update schema (all fields optional)
export const productUpdateSchema = productSchema.partial()

export type ProductInput = z.infer<typeof productSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
