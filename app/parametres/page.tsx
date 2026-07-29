'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Plus, Edit2, Trash2, Check, Info } from 'lucide-react'
import { useBoutique } from '@/components/BoutiqueProvider'
import BoutiqueFormModal from '@/components/BoutiqueFormModal'
import { useLangue } from '@/components/LangueProvider'
import { LANGUES } from '@/lib/i18n'
import { Boutique } from '@/lib/types'

export default function Parametres() {
  const { t, langue, setLangue } = useLangue()
  const { boutiques, boutiqueActive, changerBoutique, ajouterBoutique, modifierBoutique, supprimerBoutique } = useBoutique()
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Boutique | null>(null)

  const ouvrirAjout = () => {
    setEdition(null)
    setShowForm(true)
  }

  const ouvrirEdition = (b: Boutique) => {
    setEdition(b)
    setShowForm(true)
  }

  const soumettre = (data: { nom: string; type: Boutique['type']; emoji: string; couleur: string }) => {
    if (edition) {
      modifierBoutique(edition.id, data)
    } else {
      ajouterBoutique(data)
    }
    setShowForm(false)
  }

  const supprimer = (b: Boutique) => {
    if (boutiques.length <= 1) return
    if (confirm(t.confirmerSuppressionBoutique)) {
      supprimerBoutique(b.id)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{t.parametres}</h2>
      </div>

      {/* Mes Boutiques */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#f5f0e8', fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={17} color="#D4AF37" /> {t.mesBoutiques}
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={ouvrirAjout}
            className="sugu-gold-fab"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0A1628', border: 'none', borderRadius: 8, padding: '0.55rem 0.9rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
          >
            <Plus size={15} /> {t.ajouterBoutique}
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {boutiques.map((b, i) => {
            const active = b.id === boutiqueActive?.id
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                style={{
                  background: '#0c1528',
                  border: active ? `2px solid ${b.couleur}` : '1px solid #16233d',
                  borderRadius: 12,
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{b.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f5f0e8', fontWeight: 700, margin: 0, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.nom}</p>
                    <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0.15rem 0 0' }}>{b.type}</p>
                  </div>
                  {active && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22d98a', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(34,217,138,0.1)', padding: '0.2rem 0.5rem', borderRadius: 99 }}>
                      <Check size={12} /> Actif
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!active && (
                    <button
                      onClick={() => changerBoutique(b.id)}
                      style={{ flex: 1, background: 'rgba(212,175,55,0.1)', border: 'none', borderRadius: 8, padding: '0.45rem', cursor: 'pointer', color: '#D4AF37', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      Activer
                    </button>
                  )}
                  <button
                    onClick={() => ouvrirEdition(b)}
                    style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 8, padding: '0.45rem', cursor: 'pointer', color: '#00BCD4', width: active ? '100%' : 36, flex: active ? 1 : undefined }}
                  >
                    <Edit2 size={14} style={{ margin: '0 auto' }} />
                  </button>
                  {boutiques.length > 1 && (
                    <button
                      onClick={() => supprimer(b)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '0.45rem', cursor: 'pointer', color: '#ef4444', width: 36 }}
                    >
                      <Trash2 size={14} style={{ margin: '0 auto' }} />
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Langue */}
      <section style={{ marginBottom: '2rem', background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
        <h3 style={{ color: '#f5f0e8', fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem' }}>{t.langue}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.6rem' }}>
          {LANGUES.map((l) => {
            const selectionne = langue === l.code
            return (
              <button
                key={l.code}
                onClick={() => setLangue(l.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 10,
                  border: selectionne ? '2px solid #D4AF37' : '1px solid #16233d',
                  background: selectionne ? 'rgba(212,175,55,0.1)' : '#070e1f',
                  color: selectionne ? '#D4AF37' : '#9ba8c4',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <span>{l.drapeau}</span> {l.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* A propos */}
      <section style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
        <h3 style={{ color: '#f5f0e8', fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} color="#00BCD4" /> {t.aPropos}
        </h3>
        <p style={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.3rem', margin: '0 0 0.25rem', fontFeatureSettings: '"kern" 1' }}>SUGU</p>
        <p style={{ color: '#9ba8c4', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{t.tagline} — FORGE Afrika</p>
        <p style={{ color: '#4e5f82', fontSize: '0.78rem', margin: 0 }}>{t.version} 1.0.0</p>
      </section>

      <BoutiqueFormModal open={showForm} onClose={() => setShowForm(false)} onSubmit={soumettre} edition={edition} />
    </div>
  )
}
