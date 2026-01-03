/**
 * Login API route
 * Uses MongoDB if available, falls back to demo mode
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession, findUserByEmail, verifyPassword, isDbAvailable } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // If MongoDB is available, authenticate with database
    if (isDbAvailable()) {
      const user = await findUserByEmail(email)
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const isValidPassword = await verifyPassword(password, user.password)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Create session
      const userId = user._id instanceof ObjectId ? user._id.toString() : (user._id as string) || ''
      await createSession(userId)

      return NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role || 'owner',
          },
        },
        { status: 200 }
      )
    }

    // Demo mode: Always succeed
    await createSession('demo-owner')

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful (demo mode)',
        user: {
          id: 'demo-owner',
          email: email.toLowerCase() || 'demo@caffixo.com',
          name: 'Demo Restaurant',
          role: 'owner',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    
    // In demo mode, return success to prevent UI failures
    if (!isDbAvailable()) {
      return NextResponse.json(
        {
          success: true,
          message: 'Login successful (demo mode)',
          user: {
            id: 'demo-owner',
            email: 'demo@caffixo.com',
            name: 'Demo Restaurant',
            role: 'owner',
          },
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
