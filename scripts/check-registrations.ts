import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Checking farmer registrations...")
  
  const registrations = await prisma.farmerRegistration.findMany()
  console.log(`Found ${registrations.length} total registrations`)
  
  registrations.forEach(reg => {
    console.log(`- ID: ${reg.id}`)
    console.log(`  User ID: ${reg.userId}`)
    console.log(`  Farm Name: ${reg.farmName}`)
    console.log(`  Location: ${reg.location}`)
    console.log(`  Status: ${reg.status}`)
    console.log(`  Created At: ${reg.createdAt}`)
    console.log(`  Products: ${reg.products}`)
    console.log()
  })
  
  const pendingRegistrations = await prisma.farmerRegistration.findMany({
    where: { status: "PENDING" }
  })
  console.log(`Found ${pendingRegistrations.length} pending registrations`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
