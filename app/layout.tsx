import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fredoka } from 'next/font/google'
import './globals.css'
import EnregistrementSW from '@/components/EnregistrementSW'
import RouteProviders from '@/components/RouteProviders'
import { Toaster } from 'sonner'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SUGU | Sachez ce que vous avez gagné',
  description: 'Le cahier de comptes du commerçant, devenu simple. SUGU aide à suivre les produits, ventes, achats, clients et stocks.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'SUGU', statusBarStyle: 'black-translucent' },
  openGraph: {
    title: 'SUGU | Sachez ce que vous avez gagné',
    description: 'Le cahier de comptes du commerçant, devenu simple.',
    images: ['/brand/logo.svg'],
  },
}

export const viewport: Viewport = { themeColor: '#1F3A2B', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${dmSans.variable}`}>
      <body>
        <RouteProviders>{children}</RouteProviders>
        <EnregistrementSW />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#263F30', border: '1px solid #496653', color: '#F2EBCF' },
          }}
        />
      </body>
    </html>
  )
}
