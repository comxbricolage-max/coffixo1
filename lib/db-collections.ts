/**
 * MongoDB Collections Access
 * Provides type-safe access to all MongoDB collections
 * Falls back to mock data if MongoDB is not connected
 */

import { Db, Collection, ObjectId } from 'mongodb'
import { getDb } from './db'
import { isMongoConnected } from './mongodb'
import type { User } from './auth'
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
  BillOfMaterial,
} from './mock-data'

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  TABLES: 'tables',
  STAFF: 'staff',
  CLIENTS: 'clients',
  RAW_MATERIALS: 'rawMaterials',
  DIRECT_STOCK: 'directStock',
  SUPPLIERS: 'suppliers',
  PURCHASES: 'purchases',
  INVENTORY_SNAPSHOTS: 'inventorySnapshots',
} as const

/**
 * Get users collection
 */
export async function getUsersCollection(): Promise<Collection<User> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<User>(COLLECTIONS.USERS)
}

/**
 * Get orders collection
 */
export async function getOrdersCollection(): Promise<Collection<Order> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Order>(COLLECTIONS.ORDERS)
}

/**
 * Get products collection
 */
export async function getProductsCollection(): Promise<Collection<Product> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Product>(COLLECTIONS.PRODUCTS)
}

/**
 * Get categories collection
 */
export async function getCategoriesCollection(): Promise<Collection<Category> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Category>(COLLECTIONS.CATEGORIES)
}

/**
 * Get tables collection
 */
export async function getTablesCollection(): Promise<Collection<Table> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Table>(COLLECTIONS.TABLES)
}

/**
 * Get staff collection
 */
export async function getStaffCollection(): Promise<Collection<Staff> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Staff>(COLLECTIONS.STAFF)
}

/**
 * Get clients collection
 */
export async function getClientsCollection(): Promise<Collection<Client> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Client>(COLLECTIONS.CLIENTS)
}

/**
 * Get raw materials collection
 */
export async function getRawMaterialsCollection(): Promise<Collection<RawMaterial> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<RawMaterial>(COLLECTIONS.RAW_MATERIALS)
}

/**
 * Get direct stock collection
 */
export async function getDirectStockCollection(): Promise<Collection<DirectStock> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<DirectStock>(COLLECTIONS.DIRECT_STOCK)
}

/**
 * Get suppliers collection
 */
export async function getSuppliersCollection(): Promise<Collection<Supplier> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Supplier>(COLLECTIONS.SUPPLIERS)
}

/**
 * Get purchases collection
 */
export async function getPurchasesCollection(): Promise<Collection<Purchase> | null> {
  const db = await getDb()
  if (!db) return null
  return db.collection<Purchase>(COLLECTIONS.PURCHASES)
}

/**
 * Check if MongoDB is available
 */
export function isDbAvailable(): boolean {
  return isMongoConnected()
}

/**
 * Convert MongoDB ObjectId to string
 */
export function toObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id
  if (ObjectId.isValid(id)) return new ObjectId(id)
  throw new Error(`Invalid ObjectId: ${id}`)
}

/**
 * Convert MongoDB document to plain object with string ID
 */
export function toPlainObject<T extends { _id?: ObjectId | string }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc
  return {
    ...rest,
    id: _id instanceof ObjectId ? _id.toString() : (_id as string) || '',
  } as Omit<T, '_id'> & { id: string }
}

