// 🧪 DEMO MODE – NO DATABASE
// TODO: Add authentication checks when MongoDB is connected
// Currently allows all routes for demo mode

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 🧪 DEMO MODE: Allow all routes, no authentication checks
  // TODO: Add session validation and redirects when database is connected
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
