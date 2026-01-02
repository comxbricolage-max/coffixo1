import clientPromise, { isMongoConnected } from './mongodb'

/**
 * Get MongoDB database instance
 * Returns null if MongoDB is not connected (demo mode)
 */
export async function getDb() {
  if (!isMongoConnected() || !clientPromise) {
    return null
  }
  const client = await clientPromise
  const dbName = process.env.MONGODB_DB_NAME || 'caffexo'
  return client.db(dbName)
}

/**
 * Get users collection
 * Returns null if MongoDB is not connected (demo mode)
 */
export async function getUsersCollection() {
  const db = await getDb()
  if (!db) {
    return null
  }
  return db.collection('users')
}

