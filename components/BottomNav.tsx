'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { m as motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, X } from 'lucide-react'
import { useLangue } from '@/components/LangueProvider'
import { LANGUES } from '@/lib/i18n'
import { NAV_ACCUEIL, NAV_AUTRES, NAV_CAISSE, NAV_CLIENTS, NAV_PRODUITS, type NavItem } from '@/lib/nav'

const COULEUR_ACTIF = '#D4AF37'
const COULEUR_INACTIF = '#9ba8c4'

const PRINCIPAUX: NavItem[] = [NAV_ACCUEIL, NAV_PRODUITS, NAV_CAISSE, NAV_CLIENTS]

function lienStyle(actif: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.15rem',
    minHeight: 64,
    minWidth: 48,
    padding: '0.35rem 0.15rem',
    textDecoration: 'none',
    color: actif ? COULEUR_ACTIF : COULEUR_INACTIF,
  }
}

function pastilleStyle(central: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: central ? 48 : 32,
    height: central ? 48 : 32,
    borderRadius: 14,
    background: central ? COULEUR_ACTIF : 'transparent',
    marginTop: central ? -16 : 0,
    boxShadow: central ? '0 4px 14px rgba(212,175,55,0.4)' : 'none',
  }
}

function libelleStyle(actif: boolean): React.CSSProperties {
  return { fontSize: '0.75rem', fontWeight: actif ? 800 : 600, whiteSpace: 'nowrap' }
}

export default function BottomNav() {
  const pathname = usePathname()
  const { t, langue, setLangue } = useLangue()
  const [plusOuvert, setPlusOuvert] = useState(false)

  useEffect(() => {
    setPlusOuvert(false)
  }, [pathname])

  if (pathname === '/caisse') return null

  const pageDansPlus = NAV_AUTRES.some((n) => n.href === pathname)
  const plusActif = pageDansPlus || plusOuvert

  return (
    <>
      <AnimatePresence>
        {plusOuvert && (
          <motion.div
            key="plus-fond"
            className="no-print sugu-plus-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlusOuvert(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(7,14,31,0.7)', zIndex: 58 }}
          >
            <motion.div
              role="dialog"
              aria-label="Toutes les pages"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                background: '#0c1528',
                borderTop: '1px solid #1f3054',
                borderRadius: '16px 16px 0 0',
                padding: '1rem 1rem calc(5rem + env(safe-area-inset-bottom, 0px))',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2 style={{ color: '#D4AF37', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Toutes les pages</h2>
                <button
                  onClick={() => setPlusOuvert(false)}
                  aria-label="Fermer"
                  style={{ width: 48, height: 48, background: 'transparent', border: 'none', color: '#9ba8c4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={22} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {NAV_AUTRES.map(({ href, icon: Icon, label }) => {
                  const actif = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        minHeight: 56,
                        padding: '0.5rem 0.9rem',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: actif ? '#0A1628' : '#f5f0e8',
                        background: actif ? COULEUR_ACTIF : '#111d34',
                        border: '1px solid #1f3054',
                      }}
                    >
                      <Icon size={20} />
                      {label(t)}
                    </Link>
                  )
                })}
              </div>
              <label
                htmlFor="sugu-langue-plus"
                style={{ display: 'block', color: '#9ba8c4', fontSize: '0.85rem', fontWeight: 600, margin: '1.1rem 0 0.4rem' }}
              >
                {t.langue}
              </label>
              <select
                id="sugu-langue-plus"
                value={langue}
                onChange={(e) => setLangue(e.target.value as typeof langue)}
                style={{ width: '100%', minHeight: 52, background: '#070e1f', border: '1px solid #1f3054', borderRadius: 12, padding: '0 0.9rem', color: '#f5f0e8' }}
              >
                {LANGUES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.drapeau} {l.label}
                  </option>
                ))}
              </select>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Navigation principale"
        className="sugu-bottom-nav no-print"
        style={{
          display: 'none',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#070e1f',
          borderTop: '1px solid #16233d',
          zIndex: 60,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRINCIPAUX.map((item) => {
          const Icon = item.icon
          const central = item === NAV_CAISSE
          const actif = pathname === item.href
          return (
            <Link key={item.href} href={item.href} aria-current={actif ? 'page' : undefined} style={lienStyle(actif)}>
              <span style={pastilleStyle(central)}>
                <Icon size={central ? 24 : 22} color={central ? '#0A1628' : actif ? COULEUR_ACTIF : COULEUR_INACTIF} />
              </span>
              <span style={libelleStyle(actif)}>{item.label(t)}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setPlusOuvert((v) => !v)}
          aria-expanded={plusOuvert}
          aria-label="Plus de pages"
          style={{ ...lienStyle(plusActif), background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          <span style={pastilleStyle(false)}>
            <MoreHorizontal size={22} color={plusActif ? COULEUR_ACTIF : COULEUR_INACTIF} />
          </span>
          <span style={libelleStyle(plusActif)}>Plus</span>
        </button>
      </nav>
    </>
  )
}
