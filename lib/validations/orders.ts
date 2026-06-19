import { z } from "zod"

// Order item schema
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
})

// Order schema
export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  customerAddress: z.string().optional(),
  customerNote: z.string().optional(),
})

// Order status update schema
export const orderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "WHATSAPP_PENDING", "CONFIRMED"]),
})

// WhatsApp order schema
export const whatsappOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
  customerNote: z.string().optional(),
  customerAddress: z.string().optional(),
})

export type OrderInput = z.infer<typeof orderSchema>
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>
export type WhatsAppOrderInput = z.infer<typeof whatsappOrderSchema>
