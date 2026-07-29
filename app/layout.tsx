import type { Metadata } from 'next'
import './globals.css'
import { LangueProvider } from '@/components/LangueProvider'
import { BoutiqueProvider } from '@/components/BoutiqueProvider'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'SUGU — Votre Caisse Digitale',
  description: 'SUGU — la caisse et la gestion digitale pensées pour les commerçants africains. Multi-boutiques, offline-first, FORGE Afrika.',
  icons: {
    icon: '/logo-sugu-icon.svg',
    shortcut: '/logo-sugu-icon.svg',
    apple: '/logo-sugu-icon.svg',
  },
  openGraph: {
    title: 'SUGU — Votre Caisse Digitale',
    description: 'SUGU — la caisse et la gestion digitale pensées pour les commerçants africains. Multi-boutiques, offline-first, FORGE Afrika.',
    images: ['/logo-sugu.svg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body
        style={{
          background: '#0A1628',
          color: '#F8F9FA',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <LangueProvider>
          <BoutiqueProvider>
            <AppShell>{children}</AppShell>
          </BoutiqueProvider>
        </LangueProvider>
      </body>
    </html>
  )
}
