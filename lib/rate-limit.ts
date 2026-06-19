// Simple in-memory rate limiting
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)
  
  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    rateLimitMap.delete(identifier)
  }
  
  const currentEntry = rateLimitMap.get(identifier) || {
    count: 0,
    resetTime: now + windowMs
  }
  
  if (currentEntry.resetTime < now) {
    currentEntry.count = 0
    currentEntry.resetTime = now + windowMs
  }
  
  if (currentEntry.count >= limit) {
    return {
      success: false,
      remaining: 0
    }
  }
  
  currentEntry.count++
  rateLimitMap.set(identifier, currentEntry)
  
  return {
    success: true,
    remaining: limit - currentEntry.count
  }
}

export function getRateLimitInfo(identifier: string): { count: number; resetTime: number } {
  const entry = rateLimitMap.get(identifier)
  if (!entry) {
    return { count: 0, resetTime: Date.now() + 15 * 60 * 1000 }
  }
  return entry
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)
