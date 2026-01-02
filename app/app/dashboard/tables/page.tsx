'use client'

// 🧪 DEMO MODE – NO DATABASE
// TODO: Replace with real database queries when MongoDB is connected

import { useState } from 'react'
import AppCard from '@/components/ui/AppCard'
import StatusBadge from '@/components/ui/StatusBadge'
import SectionHeader from '@/components/ui/SectionHeader'
import GradientButton from '@/components/ui/GradientButton'
import KPIStatCard from '@/components/ui/KPIStatCard'
import { mockTables, type Table } from '@/lib/mock-data'
import { QrCode, Download, Printer, CheckCircle, XCircle, Plus } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function TablesPage() {
  let t: (key: string, params?: Record<string, string | number>) => string
  try {
    const translation = useTranslation()
    t = translation.t
  } catch {
    t = (key: string) => key
  }
  const [tables, setTables] = useState<Table[]>(mockTables || [])
  const [copiedTable, setCopiedTable] = useState<string | null>(null)

  const copyQRCode = (tableNumber: string) => {
    try {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return
      }
      const qrUrl = `${window.location.origin}/order/${tableNumber}`
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(qrUrl).catch(() => {})
      }
      setCopiedTable(tableNumber)
      setTimeout(() => setCopiedTable(null), 2000)
    } catch {
      // Silent fail
    }
  }

  const downloadQR = (tableNumber: string) => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      const qrUrl = `${window.location.origin}/order/${tableNumber}`
      if (typeof alert !== 'undefined') {
        alert(`QR Code URL for Table ${tableNumber}:\n${qrUrl}\n\nQR image generation will be available when QR library is integrated.`)
      }
    } catch {
      // Silent fail
    }
  }

  const printQR = (tableNumber: string) => {
    try {
      if (typeof window === 'undefined') {
        return
      }
      if (typeof alert !== 'undefined') {
        alert(`Print QR code for Table ${tableNumber}\n\nPrint functionality will be available when QR library is integrated.`)
      }
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeader 
        title={t('dashboard.tables.title')} 
        subtitle={t('dashboard.tables.subtitle')}
        icon={QrCode}
        action={
          <GradientButton variant="orange">
            <Plus className="h-4 w-4" />
            {t('dashboard.tables.addTable')}
          </GradientButton>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIStatCard
          label={t('dashboard.tables.totalTables')}
          value={tables.length}
          icon={QrCode}
          gradient="orange"
        />
        <KPIStatCard
          label={t('dashboard.tables.availableTables')}
          value={tables.filter(t => t.status === 'available').length}
          icon={CheckCircle}
          gradient="green"
        />
        <KPIStatCard
          label={t('dashboard.tables.occupiedTables')}
          value={tables.filter(t => t.status === 'occupied').length}
          icon={XCircle}
          gradient="red"
        />
      </div>

      {/* Tables Grid */}
      <SectionHeader 
        title={t('dashboard.tables.allTables')} 
        subtitle={t('dashboard.tables.generateAndManage')}
        icon={QrCode}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <AppCard 
            key={table.id}
            className={`border-2 hover:scale-[1.02] transition-all ${
              table.status === 'available' 
                ? 'border-green-500/30 bg-green-500/5' 
                : 'border-orange-500/30 bg-orange-500/5'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('dashboard.tables.table', { number: table.number })}</h3>
                <StatusBadge variant={table.status === 'available' ? 'success' : 'warning'}>
                  {table.status === 'available' ? t('dashboard.tables.available') : t('dashboard.tables.occupied')}
                </StatusBadge>
              </div>
            </div>
            
            {/* QR Code Placeholder */}
            <div className="bg-[#0f0f0f] rounded-xl p-8 mb-4 flex items-center justify-center border border-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-10 w-10 text-orange-400" />
                </div>
                <p className="text-xs text-gray-400">{t('dashboard.tables.qrCodePlaceholder')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('dashboard.tables.tableNumber', { number: table.number })}</p>
              </div>
            </div>

            <div className="space-y-2">
              <GradientButton 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={() => copyQRCode(table.number)}
              >
                {copiedTable === table.number ? (
                  <>{t('dashboard.tables.copied')}</>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t('dashboard.tables.copyLink')}
                  </>
                )}
              </GradientButton>
              <div className="grid grid-cols-2 gap-2">
                <GradientButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadQR(table.number)}
                >
                  <Download className="h-4 w-4" />
                  {t('dashboard.tables.download')}
                </GradientButton>
                <GradientButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => printQR(table.number)}
                >
                  <Printer className="h-4 w-4" />
                  {t('dashboard.tables.print')}
                </GradientButton>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  )
}
