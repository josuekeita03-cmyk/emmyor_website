import { prisma } from "./prisma"
import { randomBytes } from "crypto"

/**
 * Generate a random token for email verification or password reset
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Get user's preferred locale from database or default to 'en'
 */
export async function getUserLocale(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLocale: true },
    })
    
    return user?.preferredLocale || "en"
  } catch (error) {
    console.error("Error fetching user locale:", error)
    return "en"
  }
}

/**
 * Create email verification token
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Store token in settings table for simplicity
  // In production, you might want a separate table for tokens
  await prisma.settings.upsert({
    where: { key: `email_verification_${userId}` },
    update: {
      value: token,
    },
    create: {
      key: `email_verification_${userId}`,
      value: token,
      description: `Email verification token for user ${userId}`,
    },
  })

  // Set expiration as a separate setting
  await prisma.settings.upsert({
    where: { key: `email_verification_${userId}_expires` },
    update: {
      value: expiresAt.toISOString(),
    },
    create: {
      key: `email_verification_${userId}_expires`,
      value: expiresAt.toISOString(),
      description: `Email verification token expiration for user ${userId}`,
    },
  })

  return token
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  // Find user with this token
  const settings = await prisma.settings.findMany({
    where: {
      value: token,
      key: {
        startsWith: "email_verification_",
      },
    },
  })

  if (settings.length === 0) {
    return false
  }

  const key = settings[0].key
  const userId = key.replace("email_verification_", "")

  // Check expiration
  const expirationSetting = await prisma.settings.findUnique({
    where: { key: `email_verification_${userId}_expires` },
  })

  if (!expirationSetting) {
    return false
  }

  const expiresAt = new Date(expirationSetting.value)
  if (expiresAt < new Date()) {
    // Token expired
    return false
  }

  // Mark user as verified (you might want to add an emailVerified field to User model)
  // For now, we'll just delete the token
  await prisma.settings.deleteMany({
    where: {
      key: {
        startsWith: `email_verification_${userId}`,
      },
    },
  })

  return true
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store token
  await prisma.settings.upsert({
    where: { key: `password_reset_${user.id}` },
    update: {
      value: token,
    },
    create: {
      key: `password_reset_${user.id}`,
      value: token,
      description: `Password reset token for user ${user.id}`,
    },
  })

  // Set expiration
  await prisma.settings.upsert({
    where: { key: `password_reset_${user.id}_expires` },
    update: {
      value: expiresAt.toISOString(),
    },
    create: {
      key: `password_reset_${user.id}_expires`,
      value: expiresAt.toISOString(),
      description: `Password reset token expiration for user ${user.id}`,
    },
  })

  return token
}

/**
 * Verify password reset token and return user ID
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const settings = await prisma.settings.findMany({
    where: {
      value: token,
      key: {
        startsWith: "password_reset_",
      },
    },
  })

  if (settings.length === 0) {
    return null
  }

  const key = settings[0].key
  const userId = key.replace("password_reset_", "")

  // Check expiration
  const expirationSetting = await prisma.settings.findUnique({
    where: { key: `password_reset_${userId}_expires` },
  })

  if (!expirationSetting) {
    return null
  }

  const expiresAt = new Date(expirationSetting.value)
  if (expiresAt < new Date()) {
    // Token expired
    return null
  }

  return userId
}

/**
 * Delete password reset token after use
 */
export async function deletePasswordResetToken(userId: string): Promise<void> {
  await prisma.settings.deleteMany({
    where: {
      key: {
        startsWith: `password_reset_${userId}`,
      },
    },
  })
}

/**
 * Send verification email (placeholder - integrate with email service)
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // Check if email service is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Verification email would be sent to ${email} with token ${token}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email</p>`,
    })
    
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error("Failed to send verification email:", error)
    console.log(`Verification email would be sent to ${email} with token ${token}`)
  }
}

/**
 * Send password reset email (placeholder - integrate with email service)
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // Check if email service is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Password reset email would be sent to ${email} with token ${token}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const resetUrl = `${process.env.NEXTAUTH_URL}/en/reset-password?token=${token}`
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: "Reset your password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })
    
    console.log(`Password reset email sent to ${email}`)
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    console.log(`Password reset email would be sent to ${email} with token ${token}`)
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderId: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Order confirmation email would be sent to ${email} for order ${orderId}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const itemsHtml = items.map(item => 
      `<li>${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} MAD</li>`
    ).join("")
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! Your order has been received and is being processed.</p>
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)} MAD</p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p>We will notify you when your order status changes.</p>
        <p>Thank you for shopping with EMMYOR!</p>
      `,
    })
    
    console.log(`Order confirmation email sent to ${email} for order ${orderId}`)
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    console.log(`Order confirmation email would be sent to ${email} for order ${orderId}`)
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(
  email: string,
  customerName: string,
  orderId: string,
  newStatus: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Order status update email would be sent to ${email} for order ${orderId} - status: ${newStatus}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const statusMessages: Record<string, string> = {
      PENDING: "Your order is pending processing.",
      PROCESSING: "Your order is being processed and will be shipped soon.",
      SHIPPED: "Your order has been shipped and is on its way to you!",
      DELIVERED: "Your order has been delivered. Thank you for shopping with us!",
      CANCELLED: "Your order has been cancelled.",
      WHATSAPP_PENDING: "Your WhatsApp order has been received and will be processed shortly.",
      CONFIRMED: "Your WhatsApp order has been confirmed and is being processed.",
    }
    
    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: `Order Status Update - ${orderId}`,
      html: `
        <h1>Order Status Update</h1>
        <p>Dear ${customerName},</p>
        <p>${message}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p>You can track your order status in your dashboard.</p>
        <p>Thank you for shopping with EMMYOR!</p>
      `,
    })
    
    console.log(`Order status update email sent to ${email} for order ${orderId} - status: ${newStatus}`)
  } catch (error) {
    console.error("Failed to send order status update email:", error)
    console.log(`Order status update email would be sent to ${email} for order ${orderId} - status: ${newStatus}`)
  }
}

/**
 * Send commercial onboarding email with credentials
 */
export async function sendCommercialOnboardingEmail(
  email: string,
  fullName: string,
  password: string,
  employeeId: string,
  department: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Commercial onboarding email would be sent to ${email}`)
    console.log(`Credentials - Email: ${email}, Password: ${password}, Employee ID: ${employeeId}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Create password reset token for first-time login
    const token = await createPasswordResetToken(email)
    const resetUrl = `${process.env.NEXTAUTH_URL}/en/reset-password?token=${token}`
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: "Welcome to EMMYOR - Your Commercial Account",
      html: `
        <h1>Welcome to EMMYOR!</h1>
        <p>Dear ${fullName},</p>
        <p>Your commercial account has been created successfully. Here are your account details:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
          <p><strong>Employee ID:</strong> ${employeeId}</p>
          <p><strong>Department:</strong> ${department}</p>
        </div>
        <p><strong>Important:</strong> Please change your password after your first login for security.</p>
        <p>You can change your password by clicking the link below:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Change Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Welcome to the EMMYOR team!</p>
      `,
    })
    
    console.log(`Commercial onboarding email sent to ${email}`)
  } catch (error) {
    console.error("Failed to send commercial onboarding email:", error)
    console.log(`Commercial onboarding email would be sent to ${email}`)
    console.log(`Credentials - Email: ${email}, Password: ${password}, Employee ID: ${employeeId}`)
  }
}

/**
 * Send donation confirmation email
 */
export async function sendDonationConfirmationEmail(
  donorEmail: string,
  donorName: string,
  amount: number,
  currency: string,
  farmerName?: string,
  campaignTitle?: string,
  locale: string = "en"
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Donation confirmation email would be sent to ${donorEmail}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Localized content
    const isArabic = locale === "ar"
    const subject = isArabic ? "شكراً لتبرعك" : "Thank You for Your Donation"
    const greeting = isArabic ? `عزيزي ${donorName},` : `Dear ${donorName},`
    const thankYou = isArabic 
      ? `نشكرك بصدق على تبرعك السخي بمبلغ ${amount.toFixed(2)} ${currency}.`
      : `We sincerely thank you for your generous donation of ${amount.toFixed(2)} ${currency}.`
    const supportText = farmerName 
      ? (isArabic 
        ? `سيساهم تبرعك بشكل مباشر في دعم ${farmerName} ومساعدتهم على الاستمرار في عملهم المهم.`
        : `Your contribution will directly support ${farmerName} and help them continue their important work.`)
      : ""
    const campaignText = campaignTitle
      ? (isArabic
        ? `هذا التبرع يساهم في الحملة: <strong>${campaignTitle}</strong>`
        : `This donation contributes to the campaign: <strong>${campaignTitle}</strong>`)
      : ""
    const amountLabel = isArabic ? "مبلغ التبرع:" : "Donation Amount:"
    const dateLabel = isArabic ? "التاريخ:" : "Date:"
    const impactText = isArabic
      ? "يدعمك فرقاً حقيقياً في حياة المزارعين المغاربة ويساعد في الحفاظ على تراثنا الزراعي."
      : "Your support makes a real difference in the lives of Moroccan farmers and helps preserve our agricultural heritage."
    const receiptText = isArabic
      ? "ستتصل إيكم وصل التبرع لأغراض ضريبية."
      : "You will receive a receipt for your donation for tax purposes."
    const communityText = isArabic
      ? "شكراً لكونك جزءاً من مجتمع EMMYOR!"
      : "Thank you for being part of the EMMYOR community!"
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: donorEmail,
      subject: subject,
      html: `
        <h1>${isArabic ? "شكراً لتبرعك!" : "Thank You for Your Donation!"}</h1>
        <p>${greeting}</p>
        <p>${thankYou}</p>
        ${supportText ? `<p>${supportText}</p>` : ''}
        ${campaignText ? `<p>${campaignText}</p>` : ''}
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>${amountLabel}</strong> ${amount.toFixed(2)} ${currency}</p>
          <p><strong>${dateLabel}</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>${impactText}</p>
        <p>${receiptText}</p>
        <p>${communityText}</p>
      `,
    })
    
    console.log(`Donation confirmation email sent to ${donorEmail} (locale: ${locale})`)
  } catch (error) {
    console.error("Failed to send donation confirmation email:", error)
    console.log(`Donation confirmation email would be sent to ${donorEmail} (locale: ${locale})`)
  }
}

/**
 * Send donation notification to farmer
 */
export async function sendDonationNotificationToFarmer(
  farmerEmail: string,
  farmerName: string,
  donorName: string,
  amount: number,
  currency: string,
  message?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Donation notification would be sent to farmer ${farmerEmail}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: farmerEmail,
      subject: "You Received a New Donation!",
      html: `
        <h1>New Donation Received!</h1>
        <p>Dear ${farmerName},</p>
        <p>Great news! You have received a new donation of ${amount.toFixed(2)} ${currency}.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Donor:</strong> ${donorName}</p>
          <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currency}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        ${message ? `<p><strong>Message from donor:</strong> "${message}"</p>` : ''}
        <p>This donation will help support your farming activities and contribute to the growth of your business.</p>
        <p>Thank you for being part of the EMMYOR community!</p>
      `,
    })
    
    console.log(`Donation notification sent to farmer ${farmerEmail}`)
  } catch (error) {
    console.error("Failed to send donation notification to farmer:", error)
    console.log(`Donation notification would be sent to farmer ${farmerEmail}`)
  }
}

/**
 * Send B2B consultation received email to B2B team
 */
export async function sendB2BConsultationReceivedEmail(
  companyName: string,
  contactName: string,
  email: string,
  phone: string,
  serviceType: string,
  budget?: string,
  message?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`B2B consultation notification would be sent`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: process.env.B2B_TEAM_EMAIL || "b2b@emmyor.com",
      subject: "New B2B Consultation Request",
      html: `
        <h1>New B2B Consultation Request</h1>
        <p>A new B2B consultation request has been received:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Contact:</strong> ${contactName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service Type:</strong> ${serviceType}</p>
          ${budget ? `<p><strong>Budget:</strong> ${budget} MAD</p>` : ''}
        </div>
        ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
        <p>Please follow up with this lead as soon as possible.</p>
      `,
    })
    
    console.log(`B2B consultation notification sent`)
  } catch (error) {
    console.error("Failed to send B2B consultation notification:", error)
    console.log(`B2B consultation notification would be sent`)
  }
}

/**
 * Send user registration welcome email with verification link
 */
export async function sendUserRegistrationEmail(
  email: string,
  fullName: string,
  verificationToken: string,
  locale: string = "en"
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`User registration email would be sent to ${email}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const isArabic = locale === "ar"
    const verifyUrl = `${process.env.NEXTAUTH_URL}/${locale}/verify-email?token=${verificationToken}`
    
    const subject = isArabic ? "مرحباً بك في EMMYOR" : "Welcome to EMMYOR"
    const greeting = isArabic ? `عزيزي ${fullName},` : `Dear ${fullName},`
    const welcomeText = isArabic
      ? "مرحباً بك في EMMYOR! نحن سعداء بانضمامك إلى مجتمعنا."
      : "Welcome to EMMYOR! We're excited to have you join our community."
    const verifyText = isArabic
      ? "يرجى تفعيل حسابك من خلال النقر على الرابط أدناه:"
      : "Please activate your account by clicking the link below:"
    const verifyButton = isArabic ? "تفعيل الحساب" : "Activate Account"
    const helpText = isArabic
      ? "إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد الإلكتروني."
      : "If you didn't create this account, please ignore this email."
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: subject,
      html: `
        <h1>${subject}</h1>
        <p>${greeting}</p>
        <p>${welcomeText}</p>
        <p>${verifyText}</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">${verifyButton}</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verifyUrl}</p>
        <p>${helpText}</p>
      `,
    })
    
    console.log(`User registration email sent to ${email} (locale: ${locale})`)
  } catch (error) {
    console.error("Failed to send user registration email:", error)
    console.log(`User registration email would be sent to ${email} (locale: ${locale})`)
  }
}

/**
 * Send WhatsApp order received notification to administrators
 */
export async function sendWhatsAppOrderReceivedEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  whatsappNumber: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`WhatsApp order notification would be sent for order ${orderId}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const itemsHtml = items.map(item => 
      `<li>${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} MAD</li>`
    ).join("")
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: process.env.ADMIN_EMAIL || "admin@emmyor.com",
      subject: `New WhatsApp Order Received - ${orderId}`,
      html: `
        <h1>New WhatsApp Order Received</h1>
        <p>A new order has been placed via WhatsApp:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
          <p><strong>WhatsApp:</strong> ${whatsappNumber}</p>
          <p><strong>Total:</strong> ${total.toFixed(2)} MAD</p>
        </div>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p>Please process this order and update the status accordingly.</p>
        <p>You can manage this order in the admin dashboard.</p>
      `,
    })
    
    console.log(`WhatsApp order notification sent for order ${orderId}`)
  } catch (error) {
    console.error("Failed to send WhatsApp order notification:", error)
    console.log(`WhatsApp order notification would be sent for order ${orderId}`)
  }
}

/**
 * Send farmer registration notification to admin team
 */
export async function sendFarmerRegistrationNotification(
  farmerName: string,
  farmName: string,
  email: string,
  phone: string,
  location: string,
  products: string[],
  certifications?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Farmer registration notification would be sent for ${farmerName}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const productsHtml = products.map(p => `<li>${p}</li>`).join("")
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: process.env.ADMIN_EMAIL || "admin@emmyor.com",
      subject: "New Farmer Registration Request",
      html: `
        <h1>New Farmer Registration Request</h1>
        <p>A new farmer has submitted a registration request:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Farmer Name:</strong> ${farmerName}</p>
          <p><strong>Farm Name:</strong> ${farmName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          ${certifications ? `<p><strong>Certifications:</strong> ${certifications}</p>` : ''}
        </div>
        <h3>Products:</h3>
        <ul>${productsHtml}</ul>
        <p>Please review this registration request and approve or reject it in the admin dashboard.</p>
      `,
    })
    
    console.log(`Farmer registration notification sent for ${farmerName}`)
  } catch (error) {
    console.error("Failed to send farmer registration notification:", error)
    console.log(`Farmer registration notification would be sent for ${farmerName}`)
  }
}

/**
 * Send farmer approval email with dashboard guide
 */
export async function sendFarmerApprovalEmail(
  email: string,
  farmerName: string,
  locale: string = "en"
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error("Email service not configured. RESEND_API_KEY is missing.")
    console.log(`Farmer approval email would be sent to ${email}`)
    return
  }

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    const isArabic = locale === "ar"
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/${locale}/dashboard/farmer`
    
    const subject = isArabic ? "تم قبول طلب تسجيل المزارع الخاص بك" : "Your Farmer Registration Has Been Approved"
    const greeting = isArabic ? `عزيزي ${farmerName},` : `Dear ${farmerName},`
    const approvalText = isArabic
      ? "نحن سعداء بإبلاغك بأن طلب تسجيل المزارع الخاص بك قد تمت الموافقة عليه!"
      : "We're pleased to inform you that your farmer registration has been approved!"
    const dashboardText = isArabic
      ? "يمكنك الآن الوصول إلى لوحة التحكم الخاصة بالمزارع لإدارة منتجاتك وطلباتك."
      : "You can now access your farmer dashboard to manage your products and orders."
    const dashboardButton = isArabic ? "الوصول إلى لوحة التحكم" : "Access Dashboard"
    const guideText = isArabic
      ? "إليك دليل سريع للبدء:"
      : "Here's a quick guide to get started:"
    const steps = isArabic
      ? `<ol>
        <li>أضف منتجاتك الخام إلى القائمة</li>
        <li>استلم وادعُر طلبات العملاء</li>
        <li>تتبع مبيعاتك وإيراداتك</li>
        <li>تحديث معلومات مزرعتك</li>
      </ol>`
      : `<ol>
        <li>Add your raw products to the listing</li>
        <li>Receive and manage customer orders</li>
        <li>Track your sales and revenue</li>
        <li>Update your farm information</li>
      </ol>`
    const supportText = isArabic
      ? "إذا كنت بحاجة إلى أي مساعدة، فلا تتردد في الاتصال بفريق الدعم لدينا."
      : "If you need any assistance, don't hesitate to contact our support team."
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@emmyor.com",
      to: email,
      subject: subject,
      html: `
        <h1>${subject}</h1>
        <p>${greeting}</p>
        <p>${approvalText}</p>
        <p>${dashboardText}</p>
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">${dashboardButton}</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${dashboardUrl}</p>
        <h3>${guideText}</h3>
        ${steps}
        <p>${supportText}</p>
        <p>Welcome to the EMMYOR community!</p>
      `,
    })
    
    console.log(`Farmer approval email sent to ${email} (locale: ${locale})`)
  } catch (error) {
    console.error("Failed to send farmer approval email:", error)
    console.log(`Farmer approval email would be sent to ${email} (locale: ${locale})`)
  }
}
