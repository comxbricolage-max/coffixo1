'use client'

import { ReactNode } from 'react'

interface SafeRootProps {
  children: ReactNode
}

export default function SafeRoot({ children }: SafeRootProps) {
  try {
    return <>{children}</>
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900 p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#1a1a1a] border border-red-500/30 rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Application Error</h2>
          <p className="text-gray-400 mb-6">Please refresh the page</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}

