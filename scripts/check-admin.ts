import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for admin users...')
  
  // Check if any admin users exist
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  })
  
  console.log(`Found ${adminUsers.length} admin users`)
  
  if (adminUsers.length === 0) {
    console.log('No admin users found. Creating default admin user...')
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@emmyor.com',
        password: hashedPassword,
        fullName: 'EMMYOR Admin',
        role: 'ADMIN',
        isActive: true,
        city: 'Casablanca',
        phoneNumber: '+212656271147',
        customer: {
          create: {}
        }
      }
    })
    
    console.log('Admin user created successfully!')
    console.log('Email: admin@emmyor.com')
    console.log('Password: admin123')
  } else {
    console.log('Existing admin users:')
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.fullName})`)
    })
  }
  
  // List all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log('\nAll users in database:')
  allUsers.forEach(user => {
    console.log(`- ${user.email} | ${user.fullName} | ${user.role} | Active: ${user.isActive}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
