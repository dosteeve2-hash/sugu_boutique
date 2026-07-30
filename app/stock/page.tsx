'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Package, Bell } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import { fadeInUp, staggerContainer } from '@/lib/animations'

const SEUIL_CRITIQUE = 5 // badge rouge si stock ≤ ce seuil ET < stockMin

export default function Stock() {
  const [produits, , loaded] = usePersistedBoutique<Produit[]>('produits', [])
  const [filtre, setFiltre] = useState<'tous' | 'faible' | 'ok'>('tous')

  const valeur = (p: Produit) => p.stock * p.prixAchat
  const alertes = useMemo(() => produits.filter((s) => s.stock < s.stockMin), [produits])
  const alertesCritiques = useMemo(
    () => produits.filter((p) => p.stock < p.stockMin && p.stock <= SEUIL_CRITIQUE),
    [produits]
  )
  const ok = useMemo(() => produits.filter((s) => s.stock >= s.stockMin), [produits])
  const valeurTotale = useMemo(() => produits.reduce((a, s) => a + valeur(s), 0), [produits])

  const filtered = useMemo(
    () => (filtre === 'faible' ? alertes : filtre === 'ok' ? ok : produits),
    [filtre, alertes, ok, produits]
  )

  const getPct = (s: Produit) =>
    Math.min(100, Math.round((s.stock / Math.max(s.stock, s.stockMin * 2, 1)) * 100))

  if (!loaded) return null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Stock</h2>
        <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
          Valeur totale :{' '}
          <span style={{ color: '#D4AF37', fontWeight: 600 }}>{valeurTotale.toLocaleString('fr-FR')} FCFA</span>
        </p>
      </div>

      {produits.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit en stock"
          message="Le stock se remplit automatiquement dès que vous ajoutez des produits ou des achats."
        />
      ) : (
        <>
          {/* ── Section Alertes Stock ── */}
          {alertes.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: 14,
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <Bell size={18} color="#ef4444" />
                <h3 style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                  Alertes Stock — {alertes.length} produit{alertes.length > 1 ? 's' : ''} à réapprovisionner
                </h3>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                {alertes.map((p) => {
                  const estCritique = p.stock <= SEUIL_CRITIQUE
                  return (
                    <motion.div
                      key={p.id}
                      variants={fadeInUp}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#0c1528',
                        borderRadius: 10,
                        padding: '0.6rem 1rem',
                        borderLeft: `3px solid ${estCritique ? '#ef4444' : '#f0a832'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            background: estCritique ? '#ef4444' : '#f0a832',
                            color: '#fff',
                            borderRadius: 99,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.55rem',
                            minWidth: 28,
                            textAlign: 'center',
                          }}
                        >
                          {p.stock === 0 ? 'VIDE' : p.stock}
                        </span>
                        <div>
                          <p style={{ color: '#f5f0e8', fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>
                            {p.nom}
                          </p>
                          <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: 0 }}>
                            {p.categorie} — min requis : {p.stockMin}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          background: estCritique ? 'rgba(239,68,68,0.15)' : 'rgba(240,168,50,0.15)',
                          color: estCritique ? '#ef4444' : '#f0a832',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 99,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {estCritique ? '🔴 Critique' : '⚠ Faible'}
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>

              {alertesCritiques.length > 0 && (
                <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0.75rem 0 0' }}>
                  {alertesCritiques.length} produit{alertesCritiques.length > 1 ? 's' : ''} en rupture critique (≤ {SEUIL_CRITIQUE} unités).{' '}
                  <Link href="/achats" style={{ color: '#00BCD4' }}>Commander maintenant →</Link>
                </p>
              )}
            </motion.div>
          )}

          {/* KPI cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="sugu-kpi-grid-3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
          >
            {[
              { label: 'Stock OK', value: ok.length, icon: CheckCircle, color: '#22d98a', border: '#22d98a33' },
              { label: 'Stock Faible', value: alertes.length, icon: AlertTriangle, color: '#ef4444', border: '#ef444433' },
              { label: 'Total Produits', value: produits.length, icon: Package, color: '#D4AF37', border: '#D4AF3733' },
            ].map((k) => (
              <motion.div
                key={k.label}
                variants={fadeInUp}
                style={{
                  background: '#0c1528',
                  borderRadius: 12,
                  padding: '1rem',
                  border: `1px solid ${k.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <k.icon size={28} color={k.color} />
                <div>
                  <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>{k.label}</p>
                  <p style={{ color: k.color, fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{k.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {(['tous', 'faible', 'ok'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltre(f)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 99,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: filtre === f ? '#D4AF37' : '#0c1528',
                  color: filtre === f ? '#0A1628' : '#9ba8c4',
                }}
              >
                {f === 'tous' ? `Tous (${produits.length})` : f === 'faible' ? `Faible (${alertes.length})` : `OK (${ok.length})`}
              </button>
            ))}
          </div>

          {/* Liste produits */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            {filtered.map((s) => {
              const isLow = s.stock < s.stockMin
              const estCritique = isLow && s.stock <= SEUIL_CRITIQUE
              const pct = getPct(s)
              return (
                <motion.div
                  key={s.id}
                  variants={fadeInUp}
                  style={{
                    background: '#0c1528',
                    borderRadius: 10,
                    padding: '1rem 1.25rem',
                    border: `1px solid ${estCritique ? '#ef444433' : isLow ? '#f0a83233' : '#16233d'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <p style={{ color: '#f5f0e8', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{s.nom}</p>
                      <span
                        style={{
                          background: isLow
                            ? estCritique ? 'rgba(239,68,68,0.15)' : 'rgba(240,168,50,0.15)'
                            : 'rgba(34,217,138,0.1)',
                          color: isLow ? (estCritique ? '#ef4444' : '#f0a832') : '#22d98a',
                          padding: '0.15rem 0.55rem',
                          borderRadius: 99,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {isLow ? (estCritique ? '🔴 Critique' : '⚠ Faible') : '✓ OK'}
                      </span>
                    </div>
                    <div style={{ background: '#16233d', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isLow ? (estCritique ? '#ef4444' : '#f0a832') : '#22d98a',
                          borderRadius: 99,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                      <span style={{ color: '#4e5f82', fontSize: '0.72rem' }}>{s.categorie}</span>
                      <span style={{ color: '#9ba8c4', fontSize: '0.72rem' }}>
                        Min : {s.stockMin} | Stock :{' '}
                        <strong style={{ color: isLow ? (estCritique ? '#ef4444' : '#f0a832') : '#22d98a' }}>
                          {s.stock}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 110 }}>
                    <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0 0 0.15rem', textTransform: 'uppercase' }}>Valeur</p>
                    <p style={{ color: '#D4AF37', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                      {valeur(s).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </motion.div>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#4e5f82', padding: '2rem' }}>
                Aucun produit dans cette catégorie.{' '}
                <Link href="/produits" style={{ color: '#00BCD4' }}>Gérer les produits</Link>
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
