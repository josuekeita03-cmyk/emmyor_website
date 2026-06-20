import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Checking Orders ===')
  
  // Get all orders
  const orders = await prisma.order.findMany({
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      user: true
    }
  })
  
  console.log('Total orders:', orders.length)
  
  orders.forEach(order => {
    console.log('\n--- Order ---')
    console.log('ID:', order.id)
    console.log('Status:', order.status)
    console.log('Total:', order.total)
    console.log('User:', order.user.email)
    console.log('Order Items:', order.orderItems.length)
    order.orderItems.forEach(item => {
      console.log('  - Product:', item.product.nameEn, '(ID:', item.productId, ')')
      console.log('    Quantity:', item.quantity)
      console.log('    Price:', item.price)
      console.log('    Farmer ID:', item.product.farmerId)
    })
  })
  
  // Check farmer
  console.log('\n=== Checking Farmer ===')
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
  
  if (farmer) {
    console.log('Farmer:', farmer.user.fullName)
    console.log('Farmer ID:', farmer.id)
    
    // Get farmer's products
    const farmerProducts = await prisma.product.findMany({
      where: { farmerId: farmer.id }
    })
    console.log('Farmer products:', farmerProducts.length)
    farmerProducts.forEach(p => {
      console.log('  -', p.nameEn, '(ID:', p.id, ')')
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
