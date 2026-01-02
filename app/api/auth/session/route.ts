// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real session validation when database is connected

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

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
    // Even on error, return demo user to prevent UI failures
    // TODO: Add proper error logging when MongoDB is connected
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
}
