'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Search, X, Calendar, Filter } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, ModePaiement } from '@/lib/types'

// ─── Mock data (affiché si aucune vente réelle) ───────────────────────────────
const NOMS_CLIENTS = ['Aminata Koné', 'Ibrahim Traoré', 'Fatou Diallo', 'Moussa Ouédraogo', 'Aïssa Sawadogo', 'Seydou Bah']
const MODES: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Crédit']
const ARTICLES_MOCK = [
  [{ produitId: 1, nom: 'Savon de Marseille', quantite: 3, prixUnit: 500 }, { produitId: 2, nom: 'Huile de palme 1L', quantite: 1, prixUnit: 1200 }],
  [{ produitId: 3, nom: 'Riz importé 5kg', quantite: 2, prixUnit: 3200 }],
  [{ produitId: 4, nom: 'Tomates concentrées', quantite: 4, prixUnit: 400 }, { produitId: 5, nom: 'Sucre 1kg', quantite: 2, prixUnit: 700 }],
  [{ produitId: 6, nom: 'Lait en poudre 400g', quantite: 1, prixUnit: 2500 }],
  [{ produitId: 7, nom: 'Farine de blé 5kg', quantite: 1, prixUnit: 2800 }, { produitId: 1, nom: 'Savon de Marseille', quantite: 2, prixUnit: 500 }],
]
const TOTAUX_MOCK = [2200, 6400, 3800, 2500, 8500, 4100, 1700, 9200, 3300, 5600, 7800, 2900, 4500, 6700, 3100, 8900, 2600, 5200, 4800, 7100]

const MOCK_VENTES: Vente[] = Array.from({ length: 20 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - i)
  const mode = MODES[i % MODES.length]
  return {
    id: i + 1,
    clientId: i % 3 === 0 ? (i + 1) : null,
    client: i % 3 === 0 ? NOMS_CLIENTS[Math.floor(i / 3) % NOMS_CLIENTS.length] : '',
    lignes: ARTICLES_MOCK[i % ARTICLES_MOCK.length],
    total: TOTAUX_MOCK[i],
    modePaiement: mode,
    statut: mode === 'Crédit' ? 'Crédit' : 'Payé',
    date: d.toISOString().slice(0, 10),
    satisfaction: null,
  }
})

// ─── Types filtres ─────────────────────────────────────────────────────────────
type FiltrePeriode = 'tout' | 'aujourdhui' | 'semaine' | 'mois'
type FiltreMode = 'tout' | 'comptant' | 'credit'

function isInPeriod(date: string, periode: FiltrePeriode): boolean {
  if (periode === 'tout') return true
  const now = new Date()
  const d = new Date(date)
  if (periode === 'aujourdhui') {
    return d.toDateString() === now.toDateString()
  }
  if (periode === 'semaine') {
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return d >= weekAgo
  }
  if (periode === 'mois') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  return true
}

function getModeLabel(v: Vente): string {
  return v.statut === 'Crédit' ? 'Crédit' : 'Comptant'
}

function getLignesLabel(v: Vente): string {
  if (v.lignes.length === 0) return '—'
  const first = v.lignes[0]
  const rest = v.lignes.length - 1
  return rest > 0 ? `${first.nom} +${rest}` : first.nom
}

// ─── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV(ventes: Vente[]) {
  const headers = ['Date', 'Client', 'Articles', 'Total (XOF)', 'Rendu monnaie', 'Mode']
  const rows = ventes.map((v) => [
    v.date,
    v.client || 'Client anonyme',
    v.lignes.map((l) => `${l.nom} x${l.quantite}`).join(' | '),
    String(v.total),
    '—',
    getModeLabel(v),
  ])
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historique-ventes-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HistoriquePage() {
  const [ventesReelles, , loaded] = usePersistedBoutique<Vente[]>('ventes', [])
  const [periode, setPeriode] = useState<FiltrePeriode>('tout')
  const [modeFiltre, setModeFiltre] = useState<FiltreMode>('tout')
  const [search, setSearch] = useState('')

  const sourceVentes: Vente[] = loaded && ventesReelles.length > 0 ? ventesReelles : MOCK_VENTES
  const isMock = !loaded || ventesReelles.length === 0

  const filtered = useMemo(() => {
    return sourceVentes
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .filter((v) => {
        if (!isInPeriod(v.date, periode)) return false
        if (modeFiltre === 'comptant' && v.statut === 'Crédit') return false
        if (modeFiltre === 'credit' && v.statut !== 'Crédit') return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !v.client.toLowerCase().includes(q) &&
            !v.lignes.some((l) => l.nom.toLowerCase().includes(q))
          ) return false
        }
        return true
      })
  }, [sourceVentes, periode, modeFiltre, search])

  const PERIODES: { key: FiltrePeriode; label: string }[] = [
    { key: 'tout',        label: 'Tout' },
    { key: 'aujourdhui', label: "Aujourd'hui" },
    { key: 'semaine',    label: '7 jours' },
    { key: 'mois',       label: 'Ce mois' },
  ]
  const MODES_FILTRE: { key: FiltreMode; label: string }[] = [
    { key: 'tout',     label: 'Tous' },
    { key: 'comptant', label: 'Comptant' },
    { key: 'credit',   label: 'Crédit' },
  ]

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            Historique des ventes
          </h1>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {filtered.length} vente(s) affichée(s){isMock ? ' · données d\'exemple' : ''}
          </p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0,188,212,0.1)',
            border: '1px solid rgba(0,188,212,0.25)',
            color: '#00BCD4',
            padding: '0.55rem 1rem',
            borderRadius: 10,
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Période */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={14} style={{ color: '#4e5f82' }} />
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {PERIODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriode(key)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: periode === key ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  border: periode === key ? '1px solid rgba(212,175,55,0.35)' : '1px solid #16233d',
                  color: periode === key ? '#D4AF37' : '#9ba8c4',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode paiement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} style={{ color: '#4e5f82' }} />
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {MODES_FILTRE.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setModeFiltre(key)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: modeFiltre === key ? 'rgba(0,188,212,0.12)' : 'rgba(255,255,255,0.04)',
                  border: modeFiltre === key ? '1px solid rgba(0,188,212,0.3)' : '1px solid #16233d',
                  color: modeFiltre === key ? '#00BCD4' : '#9ba8c4',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recherche */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#0c1528',
            border: '1px solid #16233d',
            borderRadius: 10,
            padding: '0.3rem 0.75rem',
            minWidth: 200,
          }}
        >
          <Search size={14} style={{ color: '#4e5f82', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Client, article…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f5f0e8', fontSize: '0.8rem', flex: 1 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ cursor: 'pointer', display: 'flex', color: '#4e5f82' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ background: '#0c1528', borderRadius: 14, border: '1px solid #16233d', overflow: 'hidden' }}
      >
        {/* En-tête colonnes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.4fr 1.8fr 1fr 0.8fr 0.9fr',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #16233d',
            color: '#4e5f82',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <span>Date</span>
          <span>Client</span>
          <span>Articles</span>
          <span>Total</span>
          <span>Monnaie</span>
          <span>Mode</span>
        </div>

        {/* Lignes */}
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#4e5f82', fontSize: '0.85rem' }}>
            Aucune vente pour cette période.
          </div>
        ) : (
          filtered.map((v, i) => {
            const isCredit = v.statut === 'Crédit'
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr 1.8fr 1fr 0.8fr 0.9fr',
                  padding: '0.75rem 1.25rem',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(22,35,61,0.7)' : 'none',
                  gap: '0.5rem',
                }}
              >
                {/* Date */}
                <span style={{ color: '#9ba8c4', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {v.date}
                </span>

                {/* Client */}
                <span style={{ color: '#f5f0e8', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.client || <span style={{ color: '#4e5f82', fontStyle: 'italic' }}>Client anonyme</span>}
                </span>

                {/* Articles */}
                <span style={{ color: '#9ba8c4', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getLignesLabel(v)}
                </span>

                {/* Total */}
                <span style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 700 }}>
                  {v.total.toLocaleString('fr-FR')} F
                </span>

                {/* Rendu monnaie */}
                <span style={{ color: '#4e5f82', fontSize: '0.8rem' }}>—</span>

                {/* Mode */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 99,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: isCredit ? 'rgba(240,168,50,0.12)' : 'rgba(34,217,138,0.1)',
                    color: isCredit ? '#f0a832' : '#22d98a',
                    border: isCredit ? '1px solid rgba(240,168,50,0.25)' : '1px solid rgba(34,217,138,0.2)',
                    width: 'fit-content',
                  }}
                >
                  {getModeLabel(v)}
                </span>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
