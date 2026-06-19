import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'josuekeita03@gmail.com' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'josuekeita03@gmail.com',
        password: hashedPassword,
        fullName: 'Admin',
        role: 'ADMIN',
        isActive: true,
        phoneNumber: '+212000000000',
        city: 'Casablanca',
      }
    })

    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    })
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
