import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { type Role } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
}

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession()
  
  if (!session?.user) {
    return null
  }
  
  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: session.user.role as Role,
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: Role[]): Promise<boolean> {
  const user = await getCurrentUser()
  return user ? roles.includes(user.role) : false
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export async function requireRole(role: Role): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (user.role !== role) {
    throw new Error(`Role ${role} required`)
  }
  
  return user
}

/**
 * Require any of the specified roles - throws error if user doesn't have any
 */
export async function requireAnyRole(roles: Role[]): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!roles.includes(user.role)) {
    throw new Error(`One of the following roles required: ${roles.join(", ")}`)
  }
  
  return user
}

/**
 * Check if user is admin or commercial (has admin access)
 */
export async function hasAdminAccess(): Promise<boolean> {
  return await hasAnyRole(["ADMIN", "COMMERCIAL"])
}

/**
 * Require admin access - throws error if user doesn't have admin access
 */
export async function requireAdminAccess(): Promise<AuthUser> {
  return await requireAnyRole(["ADMIN", "COMMERCIAL"])
}
