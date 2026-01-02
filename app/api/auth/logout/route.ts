// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real session deletion when database is connected

import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST() {
  try {
    // 🧪 DEMO MODE: Always succeed
    await deleteSession()
    return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 })
  } catch (error) {
    // Even on error, return success in demo mode
    // TODO: Add proper error logging when MongoDB is connected
    return NextResponse.json({ success: true, message: 'Logout successful (demo mode)' }, { status: 200 })
  }
}
