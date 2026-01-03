/**
 * Logout API route
 * Deletes session cookie
 */

import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

export async function POST() {
  try {
    await deleteSession()
    return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    // Always return success to prevent UI failures
    return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 })
  }
}
