import { initializeDatabase } from "@/lib/db"

try {
  console.log("Initializing database...")
  initializeDatabase()
  console.log("Database initialized successfully!")
} catch (error) {
  console.error("Error initializing database:", error)
  process.exit(1)
}
