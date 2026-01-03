/**
 * MongoDB Database Queries
 * All data access functions with automatic fallback to mock data
 * 
 * This file provides a unified interface for accessing data:
 * - If MongoDB is connected: queries real database
 * - If MongoDB is not connected: returns mock data
 * 
 * This allows the app to work in both demo mode and production mode seamlessly.
 */

import { ObjectId } from 'mongodb'
import { isMongoConnected } from './mongodb'
import {
  getOrdersCollection,
  getProductsCollection,
  getCategoriesCollection,
  getTablesCollection,
  getStaffCollection,
  getClientsCollection,
  getRawMaterialsCollection,
  getDirectStockCollection,
  getSuppliersCollection,
  getPurchasesCollection,
  toPlainObject,
} from './db-collections'
import type {
  Order,
  Product,
  Category,
  Table,
  Staff,
  Client,
  RawMaterial,
  DirectStock,
  Supplier,
  Purchase,
} from './mock-data'
import {
  mockOrders,
  mockProducts,
  mockCategories,
  mockTables,
  mockStaff,
  mockClients,
  mockRawMaterials,
  mockDirectStock,
  mockSuppliers,
  mockPurchases,
} from './mock-data'

// ============================================================================
// ORDERS
// ============================================================================

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
  if (!isMongoConnected()) {
    return mockOrders
  }

  try {
    const collection = await getOrdersCollection()
    if (!collection) return mockOrders

    const orders = await collection.find({}).sort({ createdAt: -1 }).toArray()
    return orders.map(order => ({
      ...toPlainObject(order),
      createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
      acceptedAt: order.acceptedAt ? (order.acceptedAt instanceof Date ? order.acceptedAt : new Date(order.acceptedAt)) : undefined,
      startedAt: order.startedAt ? (order.startedAt instanceof Date ? order.startedAt : new Date(order.startedAt)) : undefined,
      readyAt: order.readyAt ? (order.readyAt instanceof Date ? order.readyAt : new Date(order.readyAt)) : undefined,
      servedAt: order.servedAt ? (order.servedAt instanceof Date ? order.servedAt : new Date(order.servedAt)) : undefined,
      completedAt: order.completedAt ? (order.completedAt instanceof Date ? order.completedAt : new Date(order.completedAt)) : undefined,
    })) as Order[]
  } catch (error) {
    console.error('Error fetching orders:', error)
    return mockOrders
  }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  const allOrders = await getAllOrders()
  return allOrders.filter(order => order.status === status)
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  if (!isMongoConnected()) {
    return mockOrders.find(o => o.id === id) || null
  }

  try {
    const collection = await getOrdersCollection()
    if (!collection) {
      return mockOrders.find(o => o.id === id) || null
    }

    // Try string ID first, then ObjectId if valid
    let order = await collection.findOne({ _id: id })
    if (!order && ObjectId.isValid(id)) {
      order = await collection.findOne({ _id: new ObjectId(id) })
    }
    if (!order) return null

    return {
      ...toPlainObject(order),
      createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
      acceptedAt: order.acceptedAt ? (order.acceptedAt instanceof Date ? order.acceptedAt : new Date(order.acceptedAt)) : undefined,
      startedAt: order.startedAt ? (order.startedAt instanceof Date ? order.startedAt : new Date(order.startedAt)) : undefined,
      readyAt: order.readyAt ? (order.readyAt instanceof Date ? order.readyAt : new Date(order.readyAt)) : undefined,
      servedAt: order.servedAt ? (order.servedAt instanceof Date ? order.servedAt : new Date(order.servedAt)) : undefined,
      completedAt: order.completedAt ? (order.completedAt instanceof Date ? order.completedAt : new Date(order.completedAt)) : undefined,
    } as Order
  } catch (error) {
    console.error('Error fetching order:', error)
    return mockOrders.find(o => o.id === id) || null
  }
}

/**
 * Get today's orders
 */
export async function getTodayOrders(): Promise<Order[]> {
  const allOrders = await getAllOrders()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return allOrders.filter(order => {
    const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt)
    return orderDate >= today
  })
}

/**
 * Get today's revenue
 */
export async function getTodayRevenue(): Promise<number> {
  const todayOrders = await getTodayOrders()
  return todayOrders.reduce((sum, order) => sum + order.total, 0)
}

/**
 * Create new order
 */
export async function createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
  if (!isMongoConnected()) {
    // Demo mode: generate ID and add to mock
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      ...orderData,
    }
    mockOrders.push(newOrder)
    return newOrder
  }

  try {
    const collection = await getOrdersCollection()
    if (!collection) {
      throw new Error('Orders collection not available')
    }

    const result = await collection.insertOne({
      ...orderData,
      createdAt: orderData.createdAt || new Date(),
    })

    const created = await collection.findOne({ _id: result.insertedId })
    if (!created) throw new Error('Failed to create order')

    return {
      ...toPlainObject(created),
      createdAt: created.createdAt instanceof Date ? created.createdAt : new Date(created.createdAt),
    } as Order
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

/**
 * Update order
 */
export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  if (!isMongoConnected()) {
    const index = mockOrders.findIndex(o => o.id === id)
    if (index === -1) return null
    mockOrders[index] = { ...mockOrders[index], ...updates }
    return mockOrders[index]
  }

  try {
    const collection = await getOrdersCollection()
    if (!collection) {
      return null
    }

    // Try both string ID and ObjectId
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) }
      : { _id: id }
    
    await collection.updateOne(filter, { $set: updates })
    return await getOrderById(id)
  } catch (error) {
    console.error('Error updating order:', error)
    return null
  }
}

// ============================================================================
// PRODUCTS
// ============================================================================

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  if (!isMongoConnected()) {
    return mockProducts
  }

  try {
    const collection = await getProductsCollection()
    if (!collection) return mockProducts

    const products = await collection.find({}).toArray()
    return products.map(prod => ({
      ...toPlainObject(prod),
      createdAt: prod.createdAt instanceof Date ? prod.createdAt : new Date(prod.createdAt),
    })) as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return mockProducts
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const allProducts = await getAllProducts()
  return allProducts.filter(product => product.categoryId === categoryId)
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (!isMongoConnected()) {
    return mockProducts.find(p => p.id === id) || null
  }

  try {
    const collection = await getProductsCollection()
    if (!collection) {
      return mockProducts.find(p => p.id === id) || null
    }

    // Try string ID first, then ObjectId if valid
    let product = await collection.findOne({ _id: id })
    if (!product && ObjectId.isValid(id)) {
      product = await collection.findOne({ _id: new ObjectId(id) })
    }
    if (!product) return null

    return {
      ...toPlainObject(product),
      createdAt: product.createdAt instanceof Date ? product.createdAt : new Date(product.createdAt),
    } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return mockProducts.find(p => p.id === id) || null
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  if (!isMongoConnected()) {
    return mockCategories
  }

  try {
    const collection = await getCategoriesCollection()
    if (!collection) return mockCategories

    const categories = await collection.find({}).sort({ order: 1 }).toArray()
    return categories.map(cat => toPlainObject(cat)) as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return mockCategories
  }
}

// ============================================================================
// TABLES
// ============================================================================

/**
 * Get all tables
 */
export async function getAllTables(): Promise<Table[]> {
  if (!isMongoConnected()) {
    return mockTables
  }

  try {
    const collection = await getTablesCollection()
    if (!collection) return mockTables

    const tables = await collection.find({}).toArray()
    return tables.map(table => toPlainObject(table)) as Table[]
  } catch (error) {
    console.error('Error fetching tables:', error)
    return mockTables
  }
}

/**
 * Get table by number
 */
export async function getTableByNumber(number: string): Promise<Table | null> {
  const allTables = await getAllTables()
  return allTables.find(table => table.number === number) || null
}

// ============================================================================
// STAFF
// ============================================================================

/**
 * Get all staff
 */
export async function getAllStaff(): Promise<Staff[]> {
  if (!isMongoConnected()) {
    return mockStaff
  }

  try {
    const collection = await getStaffCollection()
    if (!collection) return mockStaff

    const staff = await collection.find({}).toArray()
    return staff.map(s => ({
      ...toPlainObject(s),
      createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt),
    })) as Staff[]
  } catch (error) {
    console.error('Error fetching staff:', error)
    return mockStaff
  }
}

// ============================================================================
// CLIENTS
// ============================================================================

/**
 * Get all clients
 */
export async function getAllClients(): Promise<Client[]> {
  if (!isMongoConnected()) {
    return mockClients
  }

  try {
    const collection = await getClientsCollection()
    if (!collection) return mockClients

    const clients = await collection.find({}).toArray()
    return clients.map(client => ({
      ...toPlainObject(client),
      lastOrderAt: client.lastOrderAt ? (client.lastOrderAt instanceof Date ? client.lastOrderAt : new Date(client.lastOrderAt)) : undefined,
    })) as Client[]
  } catch (error) {
    console.error('Error fetching clients:', error)
    return mockClients
  }
}

// ============================================================================
// RAW MATERIALS
// ============================================================================

/**
 * Get all raw materials
 */
export async function getAllRawMaterials(): Promise<RawMaterial[]> {
  if (!isMongoConnected()) {
    return mockRawMaterials
  }

  try {
    const collection = await getRawMaterialsCollection()
    if (!collection) return mockRawMaterials

    const materials = await collection.find({}).toArray()
    return materials.map(rm => ({
      ...toPlainObject(rm),
      createdAt: rm.createdAt instanceof Date ? rm.createdAt : new Date(rm.createdAt),
      expirationDate: rm.expirationDate ? (rm.expirationDate instanceof Date ? rm.expirationDate : new Date(rm.expirationDate)) : undefined,
    })) as RawMaterial[]
  } catch (error) {
    console.error('Error fetching raw materials:', error)
    return mockRawMaterials
  }
}

/**
 * Update raw material quantity
 */
export async function updateRawMaterialQuantity(id: string, quantity: number): Promise<RawMaterial | null> {
  if (!isMongoConnected()) {
    const material = mockRawMaterials.find(rm => rm.id === id)
    if (!material) return null
    material.currentQuantity = quantity
    return material
  }

  try {
    const collection = await getRawMaterialsCollection()
    if (!collection) return null

    // Try both string ID and ObjectId
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) }
      : { _id: id }
    
    await collection.updateOne(filter, { $set: { currentQuantity: quantity } })
    const updated = await collection.findOne(filter)
    if (!updated) return null

    return {
      ...toPlainObject(updated),
      createdAt: updated.createdAt instanceof Date ? updated.createdAt : new Date(updated.createdAt),
      expirationDate: updated.expirationDate ? (updated.expirationDate instanceof Date ? updated.expirationDate : new Date(updated.expirationDate)) : undefined,
    } as RawMaterial
  } catch (error) {
    console.error('Error updating raw material:', error)
    return null
  }
}

// ============================================================================
// DIRECT STOCK
// ============================================================================

/**
 * Get all direct stock
 */
export async function getAllDirectStock(): Promise<DirectStock[]> {
  if (!isMongoConnected()) {
    return mockDirectStock
  }

  try {
    const collection = await getDirectStockCollection()
    if (!collection) return mockDirectStock

    const stock = await collection.find({}).toArray()
    return stock.map(ds => ({
      ...toPlainObject(ds),
      createdAt: ds.createdAt instanceof Date ? ds.createdAt : new Date(ds.createdAt),
      lastRestocked: ds.lastRestocked ? (ds.lastRestocked instanceof Date ? ds.lastRestocked : new Date(ds.lastRestocked)) : undefined,
    })) as DirectStock[]
  } catch (error) {
    console.error('Error fetching direct stock:', error)
    return mockDirectStock
  }
}

// ============================================================================
// SUPPLIERS
// ============================================================================

/**
 * Get all suppliers
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
  if (!isMongoConnected()) {
    return mockSuppliers
  }

  try {
    const collection = await getSuppliersCollection()
    if (!collection) return mockSuppliers

    const suppliers = await collection.find({}).toArray()
    return suppliers.map(supplier => ({
      ...toPlainObject(supplier),
      createdAt: supplier.createdAt instanceof Date ? supplier.createdAt : new Date(supplier.createdAt),
    })) as Supplier[]
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return mockSuppliers
  }
}

// ============================================================================
// PURCHASES
// ============================================================================

/**
 * Get all purchases
 */
export async function getAllPurchases(): Promise<Purchase[]> {
  if (!isMongoConnected()) {
    return mockPurchases
  }

  try {
    const collection = await getPurchasesCollection()
    if (!collection) return mockPurchases

    const purchases = await collection.find({}).sort({ purchaseDate: -1 }).toArray()
    return purchases.map(purchase => ({
      ...toPlainObject(purchase),
      purchaseDate: purchase.purchaseDate instanceof Date ? purchase.purchaseDate : new Date(purchase.purchaseDate),
      createdAt: purchase.createdAt instanceof Date ? purchase.createdAt : new Date(purchase.createdAt),
    })) as Purchase[]
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return mockPurchases
  }
}

