'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AppCard from '@/components/ui/AppCard'
import GradientButton from '@/components/ui/GradientButton'
import { useTranslation } from '@/hooks/useTranslation'

export default function LoginPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      // In demo mode, API always succeeds, but check anyway
      if (data.success !== false) {
        router.push('/app/dashboard')
        router.refresh()
      } else {
        setError(data.error || t('auth.login.error'))
        setLoading(false)
      }
    } catch (err) {
      // Even on network error, redirect to dashboard in demo mode
      // TODO: Add proper error logging when MongoDB is connected
      router.push('/app/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="w-full max-w-md px-4">
        {/* Brand Cue */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="text-4xl font-bold text-white mb-2">
              {t('common.appName')}
            </h2>
          </Link>
          <p className="text-xl text-gray-300 mb-1">
            {t('auth.login.title')}
          </p>
          <p className="text-sm text-gray-400">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Login Card */}
        <AppCard className="border-orange-500/20 bg-gradient-to-br from-[#1a1a1a] to-[#252525]">
          {/* Subtle Demo Mode Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {t('auth.login.demoBadge')}
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                {t('auth.login.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-[#1a1a1a] transition-all placeholder:text-gray-500 text-white"
                placeholder={t('auth.login.emailPlaceholder')}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                {t('auth.login.passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:bg-[#1a1a1a] transition-all placeholder:text-gray-500 text-white"
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </div>

            <GradientButton
              type="submit"
              disabled={loading}
              variant="orange"
              fullWidth
              size="lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.login.loggingIn')}
                </>
              ) : (
                <>
                  {t('auth.login.submit')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </GradientButton>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-gray-400">
              {t('auth.login.noAccount')}{' '}
              <Link href="/app/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                {t('auth.login.signUp')}
              </Link>
            </p>
            <p className="text-center text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-400 transition-colors">
                {t('auth.login.backHome')}
              </Link>
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  )
}
