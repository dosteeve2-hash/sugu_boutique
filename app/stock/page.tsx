'use client'

import { useState } from 'react'
import Link from 'next/link'
import { m as motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit } from '@/lib/types'
import EmptyState from '@/components/EmptyState'

export default function Stock() {
  const [produits, , loaded] = usePersistedBoutique<Produit[]>('produits', [])
  const [filtre, setFiltre] = useState<'tous' | 'faible' | 'ok'>('tous')

  const valeur = (p: Produit) => p.stock * p.prixAchat
  const alertes = produits.filter((s) => s.stock < s.stockMin)
  const ok = produits.filter((s) => s.stock >= s.stockMin)
  const valeurTotale = produits.reduce((a, s) => a + valeur(s), 0)

  const filtered =
    filtre === 'faible' ? alertes : filtre === 'ok' ? ok : produits

  const getPct = (s: Produit) => Math.min(100, Math.round((s.stock / Math.max(s.stock, s.stockMin * 2, 1)) * 100))

  if (!loaded) return null

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Stock</h2>
        <p style={{ color: '#B7C5AE', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
          Valeur totale du stock :{' '}
          <span style={{ color: '#E3A00F', fontWeight: 600 }}>{valeurTotale.toLocaleString('fr-FR')} FCFA</span>
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
          <div className="sugu-kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#263F30', borderRadius: 12, padding: '1rem', border: '1px solid #91D9A333', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={28} color="#91D9A3" />
              <div>
                <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Stock OK</p>
                <p style={{ color: '#91D9A3', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{ok.length}</p>
              </div>
            </div>
            <div style={{ background: '#263F30', borderRadius: 12, padding: '1rem', border: '1px solid #ef444433', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertTriangle size={28} color="#ef4444" />
              <div>
                <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Stock Faible</p>
                <p style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{alertes.length}</p>
              </div>
            </div>
            <div style={{ background: '#263F30', borderRadius: 12, padding: '1rem', border: '1px solid #E3A00F33', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Package size={28} color="#E3A00F" />
              <div>
                <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Total Produits</p>
                <p style={{ color: '#E3A00F', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{produits.length}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
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
                  background: filtre === f ? '#E3A00F' : '#263F30',
                  color: filtre === f ? '#1F3A2B' : '#D9DEC9',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'tous' ? 'Tous' : f === 'faible' ? 'Stock Faible' : 'Stock OK'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map((s, i) => {
              const isLow = s.stock < s.stockMin
              const pct = getPct(s)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05 }}
                  style={{
                    background: '#263F30',
                    borderRadius: 10,
                    padding: '1rem 1.25rem',
                    border: `1px solid ${isLow ? '#ef444433' : '#496653'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <p style={{ color: '#F2EBCF', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{s.nom}</p>
                      <span
                        style={{
                          background: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(145,217,163,0.1)',
                          color: isLow ? '#ef4444' : '#91D9A3',
                          padding: '0.15rem 0.55rem',
                          borderRadius: 99,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {isLow ? '⚠ Faible' : '✓ OK'}
                      </span>
                    </div>
                    <div style={{ background: '#496653', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isLow ? '#ef4444' : '#91D9A3',
                          borderRadius: 99,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                      <span style={{ color: '#B7C5AE', fontSize: '0.75rem' }}>{s.categorie}</span>
                      <span style={{ color: '#D9DEC9', fontSize: '0.75rem' }}>
                        Min : {s.stockMin} | Stock : <strong style={{ color: isLow ? '#ef4444' : '#91D9A3' }}>{s.stock}</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 110 }}>
                    <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.15rem', textTransform: 'uppercase' }}>Valeur</p>
                    <p style={{ color: '#E3A00F', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                      {valeur(s).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </motion.div>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#B7C5AE', padding: '2rem' }}>
                Aucun produit dans cette catégorie. <Link href="/produits" style={{ color: '#E3A00F' }}>Gérer les produits</Link>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
