'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  let t: (key: string) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/app/login')
      router.refresh()
    } catch (error) {
      // Silent fail in demo mode
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-semibold hover:bg-red-500/30 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? t('common.loggingOut') : t('common.logout')}
    </button>
  )
}
