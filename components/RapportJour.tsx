'use client'

import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, BarChart2, CreditCard, FileDown } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, Client } from '@/lib/types'

const today = () => new Date().toISOString().slice(0, 10)

async function genererPDF(
  caJour: number,
  nbVentes: number,
  panierMoyen: number,
  totalCredit: number,
  boutiqueName: string
) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── En-tête ────────────────────────────────────────────────────────────────
  // Bandeau gold
  doc.setFillColor(212, 175, 55)
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(10, 22, 40)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.text('SUGU', 20, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport Journalier', 20, 26)

  // Nom boutique en haut à droite
  doc.setFontSize(9)
  doc.text(boutiqueName, 190, 12, { align: 'right' })
  doc.text(dateStr, 190, 20, { align: 'right' })

  // ── Métriques ──────────────────────────────────────────────────────────────
  const metriques = [
    {
      label: 'CA DU JOUR',
      value: `${caJour.toLocaleString('fr-FR')} FCFA`,
      note: `${nbVentes} vente(s) enregistrée(s)`,
    },
    {
      label: 'PANIER MOYEN',
      value: `${panierMoyen.toLocaleString('fr-FR')} FCFA`,
      note: nbVentes > 0 ? `sur ${nbVentes} transaction(s)` : 'Aucune vente aujourd\'hui',
    },
    {
      label: 'TOTAL CRÉDIT EN COURS',
      value: `${totalCredit.toLocaleString('fr-FR')} FCFA`,
      note: totalCredit > 0 ? 'Clients avec solde dû' : 'Aucun crédit en cours',
    },
  ]

  let y = 52
  metriques.forEach((m, i) => {
    // Fond alterné léger
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(15, y - 6, 180, 24, 'F')
    }

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(m.label, 20, y)

    doc.setTextColor(10, 22, 40)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(m.value, 20, y + 8)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(m.note, 20, y + 14)

    y += 30
  })

  // ── Séparateur ─────────────────────────────────────────────────────────────
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.8)
  doc.line(20, y, 190, y)
  y += 10

  // ── Note ───────────────────────────────────────────────────────────────────
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Rapport généré automatiquement par SUGU · Données issues du stockage local.',
    20,
    y
  )

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(212, 175, 55)
  doc.rect(0, 282, 210, 15, 'F')
  doc.setTextColor(10, 22, 40)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('FORGE Afrika © 2026 · SUGU — Votre Caisse Digitale', 105, 291, { align: 'center' })

  doc.save(`rapport-sugu-${today()}.pdf`)
}

// ─── Widget ───────────────────────────────────────────────────────────────────
export default function RapportJour() {
  const [ventes, , loadedV] = usePersistedBoutique<Vente[]>('ventes', [])
  const [clients, , loadedC] = usePersistedBoutique<Client[]>('clients', [])

  const loaded = loadedV && loadedC
  if (!loaded) return null

  const todayStr = today()
  const ventesJour = ventes.filter((v) => v.date === todayStr)
  const caJour = ventesJour.reduce((s, v) => s + v.total, 0)
  const nbVentes = ventesJour.length
  const panierMoyen = nbVentes > 0 ? Math.round(caJour / nbVentes) : 0
  const totalCredit = clients.reduce((s, c) => s + (c.soldeDu ?? 0), 0)

  const stats = [
    { icon: TrendingUp, label: 'CA du Jour',           value: `${caJour.toLocaleString('fr-FR')} F`,    color: '#D4AF37' },
    { icon: ShoppingBag, label: 'Ventes',               value: String(nbVentes),                         color: '#00BCD4' },
    { icon: BarChart2,   label: 'Panier Moyen',         value: `${panierMoyen.toLocaleString('fr-FR')} F`, color: '#22d98a' },
    { icon: CreditCard,  label: 'Total Crédit en Cours', value: `${totalCredit.toLocaleString('fr-FR')} F`, color: '#f0a832' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      style={{ background: '#0c1528', borderRadius: 14, padding: '1.25rem', border: '1px solid #16233d', marginTop: '1.5rem' }}
    >
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
            Rapport du Jour
          </h3>
          <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0.2rem 0 0' }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={() => genererPDF(caJour, nbVentes, panierMoyen, totalCredit, 'Ma Boutique')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: '#D4AF37',
            padding: '0.45rem 0.85rem',
            borderRadius: 9,
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <FileDown size={14} />
          Télécharger PDF
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{
              background: '#070e1f',
              borderRadius: 10,
              padding: '0.85rem',
              border: `1px solid ${color}22`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem',
              }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <p style={{ color, fontSize: '1rem', fontWeight: 800, margin: '0 0 0.2rem' }}>{value}</p>
            <p style={{ color: '#4e5f82', fontSize: '0.68rem', margin: 0, lineHeight: 1.3 }}>{label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
