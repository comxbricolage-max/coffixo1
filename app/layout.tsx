import type { Metadata } from 'next'
import './globals.css'
import SafeRoot from '@/components/SafeRoot'
import LanguageInitClient from '@/components/LanguageInit'

export const metadata: Metadata = {
  title: 'Caffixo - Restaurant QR Ordering',
  description: 'SaaS platform for restaurant QR code ordering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-charcoal-900 text-charcoal-100 min-h-screen antialiased">
        <SafeRoot>
          <LanguageInitClient />
          {children}
        </SafeRoot>
      </body>
    </html>
  )
}
