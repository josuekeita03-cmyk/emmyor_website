import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find the farmer with email josuekeita7@gmail.com
  const farmer = await prisma.farmer.findFirst({
    where: {
      user: {
        email: 'josuekeita7@gmail.com'
      }
    },
    include: {
      user: true
    }
  })

  if (!farmer) {
    console.error('Farmer not found with email josuekeita7@gmail.com')
    process.exit(1)
  }

  console.log('Found farmer:', farmer.user.fullName, 'ID:', farmer.id)

  // Get the farmer's products
  const farmerProducts = await prisma.product.findMany({
    where: { farmerId: farmer.id }
  })

  console.log('Farmer products:', farmerProducts.length)

  // Find a customer user
  const customer = await prisma.user.findFirst({
    where: {
      role: 'CUSTOMER'
    }
  })

  if (!customer) {
    console.error('No customer user found')
    process.exit(1)
  }

  console.log('Found customer:', customer.fullName)

  // Create a customer profile if needed
  let customerProfile = await prisma.customer.findUnique({
    where: { userId: customer.id }
  })

  if (!customerProfile) {
    customerProfile = await prisma.customer.create({
      data: {
        userId: customer.id
      }
    })
  }

  // Create test orders with different statuses
  const orders = [
    {
      userId: customer.id,
      customerId: customerProfile.id,
      total: 50.00,
      status: 'PROCESSING' as const,
      paymentMethod: 'CARD' as const,
      orderItems: {
        create: [
          {
            productId: farmerProducts[0].id,
            quantity: 2,
            price: farmerProducts[0].price
          }
        ]
      }
    },
    {
      userId: customer.id,
      customerId: customerProfile.id,
      total: 80.00,
      status: 'SHIPPED' as const,
      paymentMethod: 'CARD' as const,
      orderItems: {
        create: [
          {
            productId: farmerProducts[1].id,
            quantity: 1,
            price: farmerProducts[1].price
          }
        ]
      }
    }
  ]

  for (const orderData of orders) {
    const order = await prisma.order.create({
      data: orderData
    })
    console.log('Created order:', order.id, 'Status:', order.status)
  }

  console.log('All test orders created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
