'use client'

import { Bell, Search } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

export default function TopBar() {
  const { t } = useTranslation()

  return (
    <div className="sticky top-0 z-10 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={t('common.search')}
              className="block w-full ps-10 pe-3 py-2.5 bg-[#0f0f0f] border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 ms-4">
          <LanguageSwitcher />
          <button className="relative p-2.5 text-gray-400 hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded-xl hover:bg-gray-800/50 transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 end-1.5 block h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#1a1a1a]" />
          </button>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
