'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Cloud, CloudOff, CloudUpload, RefreshCw, ShieldAlert } from 'lucide-react'
import { joursDepuisExport } from '@/lib/backup'
import { useSauvegarde } from '@/components/SyncProvider'
import type { StatutSauvegarde } from '@/lib/sync/types'

const LIBELLES: Record<Exclude<StatutSauvegarde, 'sans-compte'>, { texte: string; couleur: string }> = {
  'a-jour': { texte: 'Sauvegarde : à jour', couleur: '#22d98a' },
  'en-attente': { texte: 'Sauvegarde : en attente', couleur: '#f0a832' },
  'hors-ligne': { texte: 'Sauvegarde : hors ligne', couleur: '#f0a832' },
  'a-faire': { texte: 'Sauvegarde : à faire', couleur: '#f0a832' },
  'session-expiree': { texte: 'Sauvegarde : reconnectez-vous', couleur: '#ef4444' },
}

export function PastilleSauvegarde() {
  const { statut, enAttente, synchroniser } = useSauvegarde()
  if (statut === 'sans-compte') return null
  const info = LIBELLES[statut]
  const Icone = statut === 'a-jour' ? Cloud : statut === 'hors-ligne' ? CloudOff : statut === 'en-attente' ? RefreshCw : CloudUpload
  const aide =
    statut === 'hors-ligne'
      ? 'Vos ventes sont gardées sur ce téléphone et partiront dès que le réseau revient.'
      : statut === 'en-attente'
        ? `${enAttente} modification${enAttente > 1 ? 's' : ''} à envoyer.`
        : null
  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print"
      data-testid="statut-sauvegarde"
      data-statut={statut}
      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}
    >
      <Link
        href={statut === 'session-expiree' ? '/compte' : '/parametres#sauvegarde'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          minHeight: 44,
          padding: '0 0.9rem',
          borderRadius: 99,
          border: `1px solid ${info.couleur}66`,
          background: `${info.couleur}14`,
          color: info.couleur,
          fontWeight: 800,
          fontSize: '0.88rem',
          textDecoration: 'none',
        }}
      >
        <Icone size={16} /> {info.texte}
      </Link>
      {aide && <span style={{ color: '#9ba8c4', fontSize: '0.82rem' }}>{aide}</span>}
      {(statut === 'en-attente' || statut === 'hors-ligne') && (
        <button
          onClick={() => void synchroniser()}
          style={{ minHeight: 44, padding: '0 0.9rem', borderRadius: 10, border: '1px solid #1f3054', background: 'transparent', color: '#00BCD4', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Réessayer
        </button>
      )}
    </div>
  )
}

export default function SauvegardeBandeau() {
  const pathname = usePathname()
  const { statut } = useSauvegarde()
  const [jours, setJours] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    const maj = () => setJours(joursDepuisExport(window.localStorage))
    maj()
    window.addEventListener('sugu-export', maj)
    return () => window.removeEventListener('sugu-export', maj)
  }, [])

  if (statut !== 'sans-compte') return <PastilleSauvegarde />

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
        Créez un compte gratuit pour les sauvegarder en ligne.
      </p>
      <Link
        href="/compte"
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
        Créer mon compte
      </Link>
    </div>
  )
}
