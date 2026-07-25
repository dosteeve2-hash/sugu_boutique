import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'DUKA — Gestion de Boutique',
  description: 'Logiciel de gestion pour commerçants africains — FORGE Afrika',
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
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minHeight: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
