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

  // Create 3 test products
  const products = [
    {
      nameEn: 'Organic Tomatoes',
      nameAr: 'طماطم عضوية',
      descriptionEn: 'Fresh organic tomatoes from local farms',
      descriptionAr: 'طماطم طازجة عضوية من المزارع المحلية',
      price: 25.00,
      unit: 'kg',
      origin: 'Marrakech',
      category: 'Vegetables',
      sku: 'TOM-001',
      stock: 100,
      farmerId: farmer.id,
      isActive: true
    },
    {
      nameEn: 'Premium Dates',
      nameAr: 'تمور فاخرة',
      descriptionEn: 'High quality Medjool dates from Morocco',
      descriptionAr: 'تمور مجدول عالية الجودة من المغرب',
      price: 80.00,
      unit: 'kg',
      origin: 'Ouarzazate',
      category: 'Fruits',
      sku: 'DAT-001',
      stock: 50,
      farmerId: farmer.id,
      isActive: true
    },
    {
      nameEn: 'Extra Virgin Olive Oil',
      nameAr: 'زيت زيتون بكر ممتاز',
      descriptionEn: 'Cold pressed extra virgin olive oil',
      descriptionAr: 'زيت زيتون بكر ممتاز معصور على البارد',
      price: 150.00,
      unit: 'liter',
      origin: 'Fes',
      category: 'Oils',
      sku: 'OIL-001',
      stock: 30,
      farmerId: farmer.id,
      isActive: true
    }
  ]

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product
    })
    console.log('Created product:', createdProduct.nameEn, 'ID:', createdProduct.id)
  }

  console.log('All products created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
