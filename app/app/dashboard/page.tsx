'use client'

import AppCard from '@/components/ui/AppCard'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  try {
    const displayUser = {
      _id: 'demo-owner',
      email: 'demo@caffixo.com',
      name: 'Demo Restaurant',
      role: 'owner',
    }
    
    const role = displayUser.role || 'owner'

    return <DashboardClient userName={displayUser.name} role={role} />
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AppCard>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-6">Something went wrong. Please try again.</p>
          <Link href="/app/dashboard" className="text-orange-400 hover:text-orange-300 font-semibold">
            Refresh
          </Link>
        </AppCard>
      </div>
    )
  }
}
