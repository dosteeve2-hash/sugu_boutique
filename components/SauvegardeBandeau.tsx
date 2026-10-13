'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { joursDepuisExport } from '@/lib/backup'

export default function SauvegardeBandeau() {
  const pathname = usePathname()
  const [jours, setJours] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    const maj = () => setJours(joursDepuisExport(window.localStorage))
    maj()
    window.addEventListener('sugu-export', maj)
    return () => window.removeEventListener('sugu-export', maj)
  }, [])

  if (jours === undefined || pathname === '/parametres' || pathname === '/caisse') return null

  const urgent = jours === null || jours >= 7

  return (
    <div
      role="note"
      className="no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
        padding: '0.75rem 1rem',
        borderRadius: 12,
        background: urgent ? 'rgba(240,168,50,0.1)' : '#111d34',
        border: `1px solid ${urgent ? '#f0a83288' : '#1f3054'}`,
      }}
    >
      <ShieldAlert size={20} color="#f0a832" style={{ flexShrink: 0 }} />
      <p style={{ flex: '1 1 200px', margin: 0, color: '#f5f0e8', fontSize: '0.9rem', lineHeight: 1.4 }}>
        <strong>Vos données sont enregistrées sur ce téléphone seulement.</strong>{' '}
        {jours === null ? 'Pas encore sauvegardé.' : jours >= 7 ? `Dernière sauvegarde il y a ${jours} jours.` : ''}
      </p>
      <Link
        href="/parametres#sauvegarde"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
          padding: '0 1.1rem',
          borderRadius: 10,
          background: '#D4AF37',
          color: '#0A1628',
          fontWeight: 800,
          fontSize: '0.9rem',
          textDecoration: 'none',
        }}
      >
        Sauvegarder
      </Link>
    </div>
  )
}
