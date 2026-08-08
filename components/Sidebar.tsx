'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Calculator,
  Package,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Users,
  Building2,
  BarChart3,
  BarChart2,
  FileText,
  Settings,
  Menu,
  X,
  History,
  TrendingUp,
  Tag,
} from 'lucide-react'
import { useLangue } from '@/components/LangueProvider'
import { LANGUES } from '@/lib/i18n'
import BoutiqueSwitcher from '@/components/BoutiqueSwitcher'

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
    { href: '/caisse', label: t.caisse, icon: Calculator },
    { href: '/produits', label: t.produits, icon: Package },
    { href: '/ventes', label: t.ventes, icon: ShoppingCart },
    { href: '/commandes', label: 'Commandes', icon: ShoppingBag },
    { href: '/historique', label: 'Historique', icon: History },
    { href: '/achats', label: t.achats, icon: Truck },
    { href: '/clients', label: t.clients, icon: Users },
    { href: '/fournisseurs', label: t.fournisseurs, icon: Building2 },
    { href: '/stock', label: t.stock, icon: BarChart3 },
    { href: '/rapports', label: t.rapports, icon: FileText },
    { href: '/promotions', label: 'Promotions', icon: Tag },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/statistiques', label: 'Statistiques', icon: TrendingUp },
    { href: '/parametres', label: t.parametres, icon: Settings },
  ]

  return (
    <>
      {/* Barre mobile */}
      <div
        className="sugu-mobile-topbar"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 250,
          background: '#070e1f',
          borderBottom: '1px solid #16233d',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0 0.75rem',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          style={{
            background: '#0c1528',
            border: '1px solid #16233d',
            borderRadius: 8,
            padding: '0.5rem',
            color: '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: 40,
            flexShrink: 0,
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <BoutiqueSwitcher compact />
        </div>
      </div>

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
          overflowY: 'auto',
        }}
      >
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #16233d', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/logo-sugu-icon.svg" alt="SUGU" width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div>
          <h1
            style={{
              color: '#D4AF37',
              fontSize: '1.75rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '0.05em',
              fontFeatureSettings: '"kern" 1',
            }}
          >
            SUGU
          </h1>
          <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0.25rem 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t.tagline}
          </p>
        </div>
      </div>

      {/* Sélecteur de boutique */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #16233d' }}>
        <BoutiqueSwitcher />
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
