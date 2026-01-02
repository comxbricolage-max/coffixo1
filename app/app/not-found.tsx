import Link from 'next/link'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal-900 p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-amber-500/30 rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">404</h2>
        <p className="text-gray-400 mb-6">This page could not be found.</p>
        <Link
          href="/app/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          <Home className="h-4 w-4" />
          Return to Login
        </Link>
      </div>
    </div>
  )
}

