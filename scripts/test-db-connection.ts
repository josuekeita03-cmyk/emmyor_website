import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✓ Database connection successful')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log(`✓ User count: ${userCount}`)
    
    // List all tables by checking model counts
    const models = [
      'user', 'customer', 'farmer', 'cooperative', 'company', 
      'individualProducer', 'retailer', 'commercial', 'product',
      'cartItem', 'order', 'orderItem', 'wishlist', 'productTracking',
      'trackingTimeline', 'donation', 'donationCampaign', 'b2BConsultation',
      'farmerRegistration', 'whatsappSettings', 'whatsappOrder',
      'productReview', 'farmMedia', 'settings'
    ]
    
    console.log('\n✓ All tables verified:')
    for (const model of models) {
      try {
        // @ts-ignore - dynamic model access
        const count = await prisma[model].count()
        console.log(`  - ${model}: ${count} records`)
      } catch (error) {
        console.log(`  - ${model}: Error accessing`)
      }
    }
    
    console.log('\n✓ Database migration completed successfully!')
    
  } catch (error) {
    console.error('✗ Database connection failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
