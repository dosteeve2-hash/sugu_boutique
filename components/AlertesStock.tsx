'use client'

import { m as motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit } from '@/lib/types'

type NiveauAlerte = 'critique' | 'bas'

function getNiveau(p: Produit): NiveauAlerte {
  return p.stock <= 2 ? 'critique' : 'bas'
}

const STYLE_NIVEAU = {
  critique: {
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.25)',
    badge: { bg: '#ef4444', text: '#fff' },
    dot: '#ef4444',
  },
  bas: {
    bg: 'rgba(227,160,15,0.08)',
    border: 'rgba(227,160,15,0.25)',
    badge: { bg: '#E3A00F', text: '#1F3A2B' },
    dot: '#E3A00F',
  },
}

export default function AlertesStock() {
  const [produits, , loaded] = usePersistedBoutique<Produit[]>('produits', [])

  if (!loaded) return null

  const alertes = produits
    .filter((p) => p.stock < p.stockMin)
    .sort((a, b) => a.stock - b.stock) // plus critique en premier

  const commander = (p: Produit) => {
    toast.success(`Commande initiée pour "${p.nom}"`, {
      description: `Stock actuel : ${p.stock} ${p.unite ?? ''}. Seuil minimum : ${p.stockMin}.`,
      duration: 4000,
    })
  }

  return (
    <div
      style={{
        background: '#263F30',
        borderRadius: 12,
        border: '1px solid #496653',
        overflow: 'hidden',
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #496653',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={17} color={alertes.length > 0 ? '#E3A00F' : '#91D9A3'} />
          <h3 style={{ color: '#F2EBCF', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
            Alertes Stock
          </h3>
          {alertes.length > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: 99,
                minWidth: 18,
                textAlign: 'center',
              }}
            >
              {alertes.length}
            </span>
          )}
        </div>
        <Link
          href="/produits"
          style={{
            color: '#00D4FF',
            fontSize: '0.75rem',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            minHeight: 44,
            padding: '0 0.5rem',
          }}
        >
          <Package size={13} /> Voir catalogue
        </Link>
      </div>

      {/* Corps */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {alertes.length === 0 ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0' }}
            >
              <CheckCircle size={16} color="#91D9A3" />
              <span style={{ color: '#91D9A3', fontSize: '0.85rem', fontWeight: 500 }}>
                Aucune alerte — tous les stocks sont suffisants.
              </span>
            </motion.div>
          ) : (
            alertes.map((p, i) => {
              const niveau = getNiveau(p)
              const style = STYLE_NIVEAU[niveau]
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: 9,
                    borderLeft: `3px solid ${style.dot}`,
                  }}
                >
                  {/* Infos produit */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#F2EBCF', fontSize: '0.82rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.nom}
                    </p>
                    <p style={{ color: '#D9DEC9', fontSize: '0.75rem', margin: '0.15rem 0 0' }}>
                      Stock : <strong style={{ color: style.dot }}>{p.stock}</strong> / min {p.stockMin} {p.unite ?? ''}
                    </p>
                  </div>

                  {/* Badge niveau */}
                  <span
                    style={{
                      background: style.badge.bg,
                      color: style.badge.text,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 99,
                      flexShrink: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {niveau === 'critique' ? 'Critique' : 'Bas'}
                  </span>

                  {/* Bouton Commander */}
                  <button
                    onClick={() => commander(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: 6,
                      padding: '0.3rem 0.6rem',
                      color: '#00D4FF',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <ShoppingCart size={12} /> Commander
                  </button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
