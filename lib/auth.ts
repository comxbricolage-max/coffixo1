// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with MongoDB connection when ready for production
// This file contains mock authentication functions for local development

import { cookies } from 'next/headers'

export interface User {
  _id?: string
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

// Demo user data - always available
// TODO: Replace with MongoDB user query when database is connected
const DEMO_USER: SafeUser = {
  _id: 'demo-owner',
  email: 'demo@caffixo.com',
  name: 'Demo Restaurant',
  role: 'owner',
  createdAt: new Date(),
}

// 🧪 MOCK: Password hashing disabled
export async function hashPassword(password: string): Promise<string> {
  return 'mock-hash'
}

// 🧪 MOCK: Password verification disabled - always returns true
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return true
}

// 🧪 MOCK: Session creation - uses simple cookie
export async function createSession(userId: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set('demo-session', userId, {
      httpOnly: true,
      secure: false, // Allow http in dev
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  } catch (error) {
    // Silently fail in demo mode
      // Silent fail in demo mode
  }
}

// 🧪 MOCK: Session retrieval - checks for demo cookie
export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('demo-session')
    return session?.value || 'demo-owner' // Always return demo user ID
  } catch (error) {
    return 'demo-owner' // Fallback to demo user
  }
}

// 🧪 MOCK: Session deletion
export async function deleteSession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('demo-session')
  } catch (error) {
    // Silently fail in demo mode
    // Silent fail in demo mode
  }
}

// 🧪 MOCK: Always returns demo user
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    // Always return demo user in demo mode
    // TODO: Replace with MongoDB query when database is connected
    return DEMO_USER
  } catch (error) {
    // Even on error, return demo user to prevent blank pages
    return DEMO_USER
  }
}
