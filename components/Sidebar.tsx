'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLangue } from '@/components/LangueProvider'
import { LANGUES } from '@/lib/i18n'
import BoutiqueSwitcher from '@/components/BoutiqueSwitcher'
import { NAV_TOUS } from '@/lib/nav'

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

  return (
    <>
      {/* Barre mobile */}
      <div
        className="sugu-mobile-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          zIndex: 250,
          background: '#1F3A2B',
          borderBottom: '1px solid #496653',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0 0.75rem',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          style={{
            background: '#263F30',
            border: '1px solid #496653',
            borderRadius: 8,
            padding: '0.5rem',
            color: '#E3A00F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            width: 48,
            height: 48,
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
          background: '#1F3A2B',
          borderRight: '1px solid #496653',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
      >
      {/* Logo */}
      <div style={{ padding: '1.15rem 1.25rem', borderBottom: '1px solid #496653', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.55rem' }}>
        <img src="/brand/logo-sombre.svg" alt="SUGU" width={152} height={64} style={{ width: 152, height: 'auto', flexShrink: 0 }} />
        <div>
          <p style={{ color: '#D9DEC9', fontSize: '0.7rem', margin: '0.15rem 0 0', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            {t.tagline}
          </p>
        </div>
      </div>

      {/* Sélecteur de boutique */}
      <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #496653' }}>
        <BoutiqueSwitcher />
      </div>

      {/* Statut connexion */}
      <div
        style={{
          padding: '0.6rem 1.25rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: isOnline ? '#91D9A3' : '#E3A00F',
          borderBottom: '1px solid #496653',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <span style={{ fontSize: '0.75rem' }}>{isOnline ? '●' : '○'}</span>
        {isOnline ? t.enLigne : t.horsLigne}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        {NAV_TOUS.map(({ href, label, icon: Icon }) => {
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
                minHeight: 48,
                borderRadius: 8,
                marginBottom: 2,
                color: active ? '#E3A00F' : '#D9DEC9',
                background: active ? 'rgba(227,160,15,0.08)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                borderLeft: active ? '2px solid #E3A00F' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={17} />
              {label(t)}
            </Link>
          )
        })}
      </nav>

      {/* Sélecteur de langue */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #496653' }}>
        <label htmlFor="sugu-langue-menu" style={{ display: 'block', color: '#B7C5AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
          {t.langue}
        </label>
        <select
          id="sugu-langue-menu"
          value={langue}
          onChange={(e) => setLangue(e.target.value as typeof langue)}
          style={{
            width: '100%',
            background: '#263F30',
            border: '1px solid #496653',
            borderRadius: 8,
            padding: '0.4rem 0.5rem',
            color: '#F2EBCF',
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
          borderTop: '1px solid #496653',
          color: '#B7C5AE',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        }}
      >
        <span style={{ color: '#E3A00F', fontWeight: 700 }}>FORGE</span> Afrika © 2026
      </div>
      </aside>
    </>
  )
}
