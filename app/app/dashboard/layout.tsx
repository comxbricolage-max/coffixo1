'use client'

import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-charcoal-900">
      <Sidebar />
      <div className="md:ms-64">
        <TopBar />
        <main className="py-8">
          <div className="max-w-7xl mx-auto ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
