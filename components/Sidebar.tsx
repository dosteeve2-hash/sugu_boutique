'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  BarChart3,
  FileText,
} from 'lucide-react'

const links = [
  { href: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
  { href: '/produits', label: 'Produits', icon: Package },
  { href: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { href: '/achats', label: 'Achats', icon: Truck },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/fournisseurs', label: 'Fournisseurs', icon: Building2 },
  { href: '/stock', label: 'Stock', icon: BarChart3 },
  { href: '/rapports', label: 'Rapports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
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
      <div
        style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid #16233d',
        }}
      >
        <h1
          style={{
            color: '#D4AF37',
            fontSize: '1.75rem',
            fontWeight: 900,
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          DUKA
        </h1>
        <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0.25rem 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Gestion de Boutique
        </p>
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
  )
}
