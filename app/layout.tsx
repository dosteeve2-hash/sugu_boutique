import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import { LangueProvider } from '@/components/LangueProvider'

export const metadata: Metadata = {
  title: 'SUGU — Mon Marché',
  description: 'Logiciel de gestion pour le secteur informel africain — FORGE Afrika',
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
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main className="sugu-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
              {children}
            </main>
            <BottomNav />
          </div>
        </LangueProvider>
      </body>
    </html>
  )
}
