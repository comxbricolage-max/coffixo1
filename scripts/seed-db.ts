/**
 * Database Seeding Script
 * Initializes MongoDB with mock data for development
 * 
 * Usage: npx tsx scripts/seed-db.ts
 * Or: npm run seed
 */

import { MongoClient, ObjectId } from 'mongodb'
import {
  mockRestaurant,
  mockCategories,
  mockProducts,
  mockTables,
  mockStaff,
  mockClients,
  mockSuppliers,
  mockRawMaterials,
  mockDirectStock,
  mockOrders,
  mockPurchases,
} from '../lib/mock-data'
import { hashPassword } from '../lib/auth'

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || 'caffexo'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables')
  console.log('💡 Create .env.local with: MONGODB_URI=your_connection_string')
  process.exit(1)
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('🔌 Connecting to MongoDB...')
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(DB_NAME)
    console.log(`📦 Using database: ${DB_NAME}`)

    // Clear existing collections (optional - comment out to keep existing data)
    console.log('\n🧹 Clearing existing collections...')
    const collections = [
      'users',
      'orders',
      'products',
      'categories',
      'tables',
      'staff',
      'clients',
      'rawMaterials',
      'directStock',
      'suppliers',
      'purchases',
    ]

    for (const collectionName of collections) {
      const collection = db.collection(collectionName)
      const count = await collection.countDocuments()
      if (count > 0) {
        await collection.deleteMany({})
        console.log(`  ✓ Cleared ${collectionName} (${count} documents)`)
      }
    }

    // Seed Users
    console.log('\n👤 Seeding users...')
    const usersCollection = db.collection('users')
    const demoUser = {
      _id: new ObjectId(),
      email: 'demo@caffixo.com',
      password: await hashPassword('demo123'),
      name: 'Demo Restaurant',
      role: 'owner',
      createdAt: new Date(),
    }
    await usersCollection.insertOne(demoUser)
    console.log(`  ✓ Created demo user: ${demoUser.email}`)

    // Seed Categories
    console.log('\n📁 Seeding categories...')
    const categoriesCollection = db.collection('categories')
    const categoryDocs = mockCategories.map(cat => ({
      _id: cat.id,
      ...cat,
    }))
    await categoriesCollection.insertMany(categoryDocs)
    console.log(`  ✓ Created ${categoryDocs.length} categories`)

    // Seed Products
    console.log('\n🍽️  Seeding products...')
    const productsCollection = db.collection('products')
    const productDocs = mockProducts.map(prod => ({
      _id: prod.id,
      ...prod,
      createdAt: prod.createdAt || new Date(),
    }))
    await productsCollection.insertMany(productDocs)
    console.log(`  ✓ Created ${productDocs.length} products`)

    // Seed Tables
    console.log('\n🪑 Seeding tables...')
    const tablesCollection = db.collection('tables')
    const tableDocs = mockTables.map(table => ({
      _id: table.id,
      ...table,
    }))
    await tablesCollection.insertMany(tableDocs)
    console.log(`  ✓ Created ${tableDocs.length} tables`)

    // Seed Staff
    console.log('\n👥 Seeding staff...')
    const staffCollection = db.collection('staff')
    const staffDocs = mockStaff.map(staff => ({
      _id: staff.id,
      ...staff,
      createdAt: staff.createdAt || new Date(),
    }))
    await staffCollection.insertMany(staffDocs)
    console.log(`  ✓ Created ${staffDocs.length} staff members`)

    // Seed Clients
    console.log('\n👤 Seeding clients...')
    const clientsCollection = db.collection('clients')
    const clientDocs = mockClients.map(client => ({
      _id: client.id,
      ...client,
    }))
    await clientsCollection.insertMany(clientDocs)
    console.log(`  ✓ Created ${clientDocs.length} clients`)

    // Seed Suppliers
    console.log('\n🏪 Seeding suppliers...')
    const suppliersCollection = db.collection('suppliers')
    const supplierDocs = mockSuppliers.map(supplier => ({
      _id: supplier.id,
      ...supplier,
      createdAt: supplier.createdAt || new Date(),
    }))
    await suppliersCollection.insertMany(supplierDocs)
    console.log(`  ✓ Created ${supplierDocs.length} suppliers`)

    // Seed Raw Materials
    console.log('\n📦 Seeding raw materials...')
    const rawMaterialsCollection = db.collection('rawMaterials')
    const rawMaterialDocs = mockRawMaterials.map(rm => ({
      _id: rm.id,
      ...rm,
      createdAt: rm.createdAt || new Date(),
    }))
    await rawMaterialsCollection.insertMany(rawMaterialDocs)
    console.log(`  ✓ Created ${rawMaterialDocs.length} raw materials`)

    // Seed Direct Stock
    console.log('\n📦 Seeding direct stock...')
    const directStockCollection = db.collection('directStock')
    const directStockDocs = mockDirectStock.map(ds => ({
      _id: ds.id,
      ...ds,
      createdAt: ds.createdAt || new Date(),
    }))
    await directStockCollection.insertMany(directStockDocs)
    console.log(`  ✓ Created ${directStockDocs.length} direct stock items`)

    // Seed Purchases
    console.log('\n💰 Seeding purchases...')
    const purchasesCollection = db.collection('purchases')
    const purchaseDocs = mockPurchases.map(purchase => ({
      _id: purchase.id,
      ...purchase,
      purchaseDate: purchase.purchaseDate || new Date(),
      createdAt: purchase.createdAt || new Date(),
    }))
    await purchasesCollection.insertMany(purchaseDocs)
    console.log(`  ✓ Created ${purchaseDocs.length} purchases`)

    // Seed Orders (optional - can be empty initially)
    console.log('\n📋 Seeding orders...')
    const ordersCollection = db.collection('orders')
    const orderDocs = mockOrders.map(order => ({
      _id: order.id,
      ...order,
      createdAt: order.createdAt || new Date(),
      acceptedAt: order.acceptedAt,
      startedAt: order.startedAt,
      readyAt: order.readyAt,
      servedAt: order.servedAt,
      completedAt: order.completedAt,
    }))
    await ordersCollection.insertMany(orderDocs)
    console.log(`  ✓ Created ${orderDocs.length} orders`)

    // Create indexes
    console.log('\n📇 Creating indexes...')
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await productsCollection.createIndex({ categoryId: 1 })
    await ordersCollection.createIndex({ tableNumber: 1 })
    await ordersCollection.createIndex({ status: 1 })
    await ordersCollection.createIndex({ createdAt: -1 })
    await rawMaterialsCollection.createIndex({ supplierId: 1 })
    console.log('  ✓ Created indexes')

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: 1`)
    console.log(`   - Categories: ${categoryDocs.length}`)
    console.log(`   - Products: ${productDocs.length}`)
    console.log(`   - Tables: ${tableDocs.length}`)
    console.log(`   - Staff: ${staffDocs.length}`)
    console.log(`   - Clients: ${clientDocs.length}`)
    console.log(`   - Suppliers: ${supplierDocs.length}`)
    console.log(`   - Raw Materials: ${rawMaterialDocs.length}`)
    console.log(`   - Direct Stock: ${directStockDocs.length}`)
    console.log(`   - Purchases: ${purchaseDocs.length}`)
    console.log(`   - Orders: ${orderDocs.length}`)
    console.log('\n🔑 Demo credentials:')
    console.log('   Email: demo@caffixo.com')
    console.log('   Password: demo123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await client.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

// Run seed
seedDatabase()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error)
    process.exit(1)
  })

