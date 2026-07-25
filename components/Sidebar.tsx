'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  BarChart3,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { useLangue } from '@/components/LangueProvider'
import { LANGUES } from '@/lib/i18n'

export default function Sidebar() {
  const pathname = usePathname()
  const { langue, setLangue, t } = useLangue()
  const [isOnline, setIsOnline] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const links = [
    { href: '/', label: t.dashboard, icon: LayoutDashboard },
    { href: '/produits', label: t.produits, icon: Package },
    { href: '/ventes', label: t.ventes, icon: ShoppingCart },
    { href: '/achats', label: t.achats, icon: Truck },
    { href: '/clients', label: t.clients, icon: Users },
    { href: '/fournisseurs', label: t.fournisseurs, icon: Building2 },
    { href: '/stock', label: t.stock, icon: BarChart3 },
    { href: '/rapports', label: t.rapports, icon: FileText },
  ]

  return (
    <>
      <button
        className="sugu-mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        style={{
          position: 'fixed',
          top: '0.75rem',
          left: '0.75rem',
          zIndex: 250,
          background: '#0c1528',
          border: '1px solid #16233d',
          borderRadius: 8,
          padding: '0.5rem',
          color: '#D4AF37',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className={`sugu-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside
        className={`sugu-sidebar${open ? ' open' : ''}`}
        style={{
          width: 240,
          minWidth: 240,
          background: '#070e1f',
          borderRight: '1px solid #16233d',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #16233d' }}>
        <h1
          style={{
            color: '#D4AF37',
            fontSize: '1.75rem',
            fontWeight: 900,
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          SUGU
        </h1>
        <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0.25rem 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t.tagline}
        </p>
      </div>

      {/* Statut connexion */}
      <div
        style={{
          padding: '0.6rem 1.25rem',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: isOnline ? '#22d98a' : '#f0a832',
          borderBottom: '1px solid #16233d',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <span style={{ fontSize: '0.6rem' }}>{isOnline ? '●' : '○'}</span>
        {isOnline ? t.enLigne : t.horsLigne}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                marginBottom: 2,
                color: active ? '#00BCD4' : '#9ba8c4',
                background: active ? 'rgba(0,188,212,0.08)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                borderLeft: active ? '2px solid #00BCD4' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sélecteur de langue */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #16233d' }}>
        <label style={{ display: 'block', color: '#4e5f82', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
          {t.langue}
        </label>
        <select
          value={langue}
          onChange={(e) => setLangue(e.target.value as typeof langue)}
          style={{
            width: '100%',
            background: '#0c1528',
            border: '1px solid #16233d',
            borderRadius: 8,
            padding: '0.4rem 0.5rem',
            color: '#f5f0e8',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        >
          {LANGUES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.drapeau} {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #16233d',
          color: '#4e5f82',
          fontSize: '0.7rem',
          letterSpacing: '0.05em',
        }}
      >
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>FORGE</span> Afrika © 2026
      </div>
      </aside>
    </>
  )
}
