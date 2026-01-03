/**
 * Session validation API route
 * Uses MongoDB if available, falls back to demo mode
 */

import { NextResponse } from 'next/server'
import { getCurrentUser, isDbAvailable } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role || 'owner',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session error:', error)
    
    // In demo mode, return demo user to prevent UI failures
    if (!isDbAvailable()) {
      return NextResponse.json(
        {
          success: true,
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
      {
        success: false,
        user: null,
      },
      { status: 401 }
    )
  }
}
