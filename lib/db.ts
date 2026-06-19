// This is a simplified in-memory database for the preview
// In production, replace this with the SQLite implementation

export type UserRole =
  | "CUSTOMER"
  | "FARMER"
  | "COOPERATIVE"
  | "COMPANY"
  | "INDIVIDUAL_PRODUCER"
  | "RETAILER"
  | "COMMERCIAL"

export type User = {
  id: string
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  city?: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

class InMemoryDB {
  private users: Map<string, User> = new Map()
  private usersByEmail: Map<string, User> = new Map()

  // Helper to generate IDs
  generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // User operations
  createUser(
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string | null,
    city: string | null,
    role: UserRole,
  ): User {
    if (this.usersByEmail.has(email)) {
      throw new Error("Email already exists")
    }

    const user: User = {
      id: this.generateId(),
      email,
      password,
      fullName,
      phoneNumber: phoneNumber || undefined,
      city: city || undefined,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.set(user.id, user)
    this.usersByEmail.set(email, user)

    return user
  }

  findUserByEmail(email: string): User | undefined {
    return this.usersByEmail.get(email)
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id)
  }
}

// Create a singleton instance
const db = new InMemoryDB()

// Export functions that match our interface
export function generateId(): string {
  return db.generateId()
}

export const userQueries = {
  createUser: {
    run: (
      id: string,
      email: string,
      password: string,
      fullName: string,
      phoneNumber: string | null,
      city: string | null,
      role: UserRole,
    ) => {
      return db.createUser(email, password, fullName, phoneNumber, city, role)
    },
  },
  findUserByEmail: {
    get: (email: string) => db.findUserByEmail(email),
  },
  findUserById: {
    get: (id: string) => db.findUserById(id),
  },
}

// Simplified profile queries that do nothing in preview
export const profileQueries = {
  createCustomer: { run: () => {} },
  createFarmer: { run: () => {} },
  createCooperative: { run: () => {} },
  createCompany: { run: () => {} },
  createIndividualProducer: { run: () => {} },
  createRetailer: { run: () => {} },
  createCommercial: { run: () => {} },
}

// Simplified transaction wrapper
export function runTransaction<T>(callback: () => T): T {
  return callback()
}

// No need to initialize for preview
export function initializeDatabase() {}

export default db
