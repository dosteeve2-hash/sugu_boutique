'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calculator, Package, ShoppingCart, Settings } from 'lucide-react'
import { useLangue } from '@/components/LangueProvider'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLangue()

  if (pathname === '/caisse') return null

  const links = [
    { href: '/', label: t.accueil, icon: LayoutDashboard },
    { href: '/produits', label: t.produits, icon: Package },
    { href: '/caisse', label: t.caisse, icon: Calculator, central: true },
    { href: '/ventes', label: t.ventes, icon: ShoppingCart },
    { href: '/parametres', label: t.parametres, icon: Settings },
  ]

  return (
    <nav
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
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {links.map(({ href, label, icon: Icon, central }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              minHeight: 60,
              padding: '0.4rem 0.25rem',
              textDecoration: 'none',
              color: active ? '#D4AF37' : '#4e5f82',
            }}
          >
            <motion.span
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: central ? 44 : 28,
                height: central ? 44 : 28,
                borderRadius: 12,
                background: central ? '#D4AF37' : 'transparent',
                marginTop: central ? -18 : 0,
                boxShadow: central ? '0 4px 14px rgba(212,175,55,0.4)' : 'none',
              }}
            >
              {!central && active && (
                <motion.span
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 12,
                    background: 'rgba(212,175,55,0.12)',
                  }}
                />
              )}
              <Icon size={central ? 22 : 18} color={central ? '#0A1628' : active ? '#D4AF37' : '#4e5f82'} style={{ position: 'relative' }} />
            </motion.span>
            <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
