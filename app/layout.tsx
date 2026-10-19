import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LangueProvider } from '@/components/LangueProvider'
import { BoutiqueProvider } from '@/components/BoutiqueProvider'
import AppShell from '@/components/AppShell'
import { SyncProvider } from '@/components/SyncProvider'
import EnregistrementSW from '@/components/EnregistrementSW'
import MotionProvider from '@/components/MotionProvider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'SUGU — Votre Caisse Digitale',
  description: 'SUGU — la caisse et la gestion digitale pensées pour les commerçants africains. Plusieurs boutiques, données enregistrées sur votre téléphone. FORGE Afrika.',
  icons: {
    icon: '/android-chrome-192x192.png',
    shortcut: '/logo-sugu-icon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'SUGU', statusBarStyle: 'black-translucent' },
  openGraph: {
    title: 'SUGU — Votre Caisse Digitale',
    description: 'SUGU — la caisse et la gestion digitale pensées pour les commerçants africains. Plusieurs boutiques, données enregistrées sur votre téléphone. FORGE Afrika.',
    images: ['/logo-sugu.svg'],
  },
}

export const viewport: Viewport = { themeColor: '#0A1628', width: 'device-width', initialScale: 1 }

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
        <MotionProvider>
          <LangueProvider>
            <BoutiqueProvider>
              <SyncProvider>
                <AppShell>{children}</AppShell>
              </SyncProvider>
            </BoutiqueProvider>
          </LangueProvider>
        </MotionProvider>
        <EnregistrementSW />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#0c1528', border: '1px solid #16233d', color: '#f5f0e8' },
          }}
        />
      </body>
    </html>
  )
}
