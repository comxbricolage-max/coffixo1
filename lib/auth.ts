/**
 * Authentication functions with MongoDB integration
 * Falls back to demo mode if MongoDB is not connected
 */

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { getUsersCollection } from './db-collections'
import { isMongoConnected } from './mongodb'
import { ObjectId } from 'mongodb'

export interface User {
  _id?: string | ObjectId
  email: string
  password: string
  name: string
  role?: string
  createdAt?: Date
}

export interface SafeUser {
  _id: string
  email: string
  name: string
  role?: string
  createdAt?: Date
}

// Demo user data - fallback when MongoDB is not available
const DEMO_USER: SafeUser = {
  _id: 'demo-owner',
  email: 'demo@caffixo.com',
  name: 'Demo Restaurant',
  role: 'owner',
  createdAt: new Date(),
}

/**
 * Check if database is available
 */
export function isDbAvailable(): boolean {
  return isMongoConnected()
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!isDbAvailable()) {
    // Demo mode: return mock hash
    return 'mock-hash'
  }
  try {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!isDbAvailable()) {
    // Demo mode: always return true
    return true
  }
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

/**
 * Create session cookie
 */
export async function createSession(userId: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set('session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  } catch (error) {
    // Silent fail - session creation is not critical
    console.error('Error creating session:', error)
  }
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (session?.value) {
      return session.value
    }
    
    // Fallback to demo mode if no session
    if (!isDbAvailable()) {
      return 'demo-owner'
    }
    
    return null
  } catch (error) {
    // Fallback to demo mode on error
    if (!isDbAvailable()) {
      return 'demo-owner'
    }
    return null
  }
}

/**
 * Delete session cookie
 */
export async function deleteSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  } catch (error) {
    // Silent fail
    console.error('Error deleting session:', error)
  }
}

/**
 * Get current user from session
 * Uses MongoDB if available, falls back to demo user
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const sessionId = await getSession()
    if (!sessionId) {
      return null
    }

    // If MongoDB is available, query database
    if (isDbAvailable()) {
      const usersCollection = await getUsersCollection()
      if (usersCollection) {
        // Try to find user by _id (ObjectId or string)
        let user: User | null = null
        
        if (ObjectId.isValid(sessionId)) {
          user = await usersCollection.findOne({ _id: new ObjectId(sessionId) })
        } else {
          user = await usersCollection.findOne({ _id: sessionId })
        }
        
        if (user) {
          return {
            _id: user._id instanceof ObjectId ? user._id.toString() : (user._id as string) || '',
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          }
        }
      }
    }

    // Fallback to demo user if MongoDB not available or user not found
    if (sessionId === 'demo-owner' || !isDbAvailable()) {
      return DEMO_USER
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    // Fallback to demo user on error
    if (!isDbAvailable()) {
      return DEMO_USER
    }
    return null
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  if (!isDbAvailable()) {
    return null
  }
  
  try {
    const usersCollection = await getUsersCollection()
    if (!usersCollection) {
      return null
    }
    
    return await usersCollection.findOne({ email: email.toLowerCase() })
  } catch (error) {
    console.error('Error finding user by email:', error)
    return null
  }
}

/**
 * Create new user
 */
export async function createUser(userData: {
  email: string
  password: string
  name: string
  role?: string
}): Promise<User | null> {
  if (!isDbAvailable()) {
    return null
  }
  
  try {
    const usersCollection = await getUsersCollection()
    if (!usersCollection) {
      return null
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create user
    const newUser: User = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'owner',
      createdAt: new Date(),
    }
    
    const result = await usersCollection.insertOne(newUser)
    
    if (result.insertedId) {
      return await usersCollection.findOne({ _id: result.insertedId })
    }
    
    return null
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}
