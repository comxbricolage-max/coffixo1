/**
 * Signup API route
 * Uses MongoDB if available, falls back to demo mode
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSession, createUser, isDbAvailable } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // If MongoDB is available, create user in database
    if (isDbAvailable()) {
      try {
        const newUser = await createUser({
          email,
          password,
          name,
          role: 'owner',
        })

        if (!newUser) {
          throw new Error('Failed to create user')
        }

        // Create session
        const userId = newUser._id instanceof ObjectId ? newUser._id.toString() : (newUser._id as string) || ''
        await createSession(userId)

        return NextResponse.json(
          {
            success: true,
            message: 'Signup successful',
            user: {
              id: userId,
              email: newUser.email,
              name: newUser.name,
              role: newUser.role || 'owner',
            },
          },
          { status: 201 }
        )
      } catch (error: any) {
        // Handle duplicate email error
        if (error.message === 'User already exists') {
          return NextResponse.json(
            { success: false, error: 'Email already registered' },
            { status: 409 }
          )
        }
        throw error
      }
    }

    // Demo mode: Always succeed
    await createSession('demo-owner')

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful (demo mode)',
        user: {
          id: 'demo-owner',
          email: email.toLowerCase() || 'demo@caffixo.com',
          name: name || 'Demo Restaurant',
          role: 'owner',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    
    // In demo mode, return success to prevent UI failures
    if (!isDbAvailable()) {
      return NextResponse.json(
        {
          success: true,
          message: 'Signup successful (demo mode)',
          user: {
            id: 'demo-owner',
            email: 'demo@caffixo.com',
            name: 'Demo Restaurant',
            role: 'owner',
          },
        },
        { status: 201 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Signup failed. Please try again.' },
      { status: 500 }
    )
  }
}
