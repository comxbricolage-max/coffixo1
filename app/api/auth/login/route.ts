// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with MongoDB authentication when database is connected

import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'

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

    // 🧪 DEMO MODE: Always succeed
    // TODO: Replace with real database authentication
    await createSession('demo-owner')

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
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
    // Even on error, return success in demo mode to prevent UI failures
    // TODO: Add proper error logging when MongoDB is connected
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
}
