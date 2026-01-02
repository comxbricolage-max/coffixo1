// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with MongoDB user creation when database is connected

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

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

    // 🧪 DEMO MODE: Always succeed
    // TODO: Replace with real database user creation
    await createSession('demo-owner')

    return NextResponse.json(
      {
        success: true,
        message: 'Signup successful',
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
    // Even on error, return success in demo mode
    // TODO: Add proper error logging when MongoDB is connected
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
}
