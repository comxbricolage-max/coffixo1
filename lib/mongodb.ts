import { MongoClient, ServerApiVersion } from 'mongodb'

// MongoDB connection configuration
// In demo mode, MONGODB_URI is optional (app works without database)
// For production, set MONGODB_URI in .env.local

const uri: string | undefined = process.env.MONGODB_URI

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// MongoDB connection options with Stable API version
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

if (uri) {
  // Only initialize MongoDB connection if URI is provided
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
}

/**
 * Get MongoDB client promise
 * Returns null if MONGODB_URI is not set (demo mode)
 */
export default clientPromise

/**
 * Check if MongoDB is connected
 */
export function isMongoConnected(): boolean {
  return clientPromise !== null
}

/**
 * Test MongoDB connection
 */
export async function testConnection(): Promise<boolean> {
  if (!clientPromise) {
    return false
  }
  
  try {
    const client = await clientPromise
    await client.db('admin').command({ ping: 1 })
    return true
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return false
  }
}

