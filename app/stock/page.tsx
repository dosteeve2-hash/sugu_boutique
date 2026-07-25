'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Package } from 'lucide-react'

const mockStock = [
  { id: 1, nom: 'Huile de Palme 5L', categorie: 'Alimentaire', stock: 45, stockMin: 10, valeur: 189000 },
  { id: 2, nom: 'Farine de Blé 50kg', categorie: 'Alimentaire', stock: 8, stockMin: 15, valeur: 176000 },
  { id: 3, nom: 'Savon Lux x12', categorie: 'Hygiène', stock: 60, stockMin: 20, valeur: 216000 },
  { id: 4, nom: 'Sucre Cristallisé 25kg', categorie: 'Alimentaire', stock: 3, stockMin: 10, valeur: 45000 },
  { id: 5, nom: 'Riz Parfumé 50kg', categorie: 'Alimentaire', stock: 22, stockMin: 8, valeur: 550000 },
  { id: 6, nom: 'Lait en Poudre 900g', categorie: 'Alimentaire', stock: 18, stockMin: 12, valeur: 99000 },
  { id: 7, nom: 'Eau de Javel 1L', categorie: 'Hygiène', stock: 80, stockMin: 30, valeur: 40000 },
]

export default function Stock() {
  const [stock] = useState(mockStock)
  const [filtre, setFiltre] = useState<'tous' | 'faible' | 'ok'>('tous')

  const alertes = stock.filter((s) => s.stock < s.stockMin)
  const ok = stock.filter((s) => s.stock >= s.stockMin)
  const valeurTotale = stock.reduce((a, s) => a + s.valeur, 0)

  const filtered =
    filtre === 'faible'
      ? stock.filter((s) => s.stock < s.stockMin)
      : filtre === 'ok'
      ? stock.filter((s) => s.stock >= s.stockMin)
      : stock

  const getPct = (s: (typeof stock)[0]) => Math.min(100, Math.round((s.stock / Math.max(s.stock, s.stockMin * 2)) * 100))

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Stock</h2>
        <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
          Valeur totale du stock :{' '}
          <span style={{ color: '#D4AF37', fontWeight: 600 }}>{valeurTotale.toLocaleString('fr-FR')} FCFA</span>
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #22d98a33', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={28} color="#22d98a" />
          <div>
            <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Stock OK</p>
            <p style={{ color: '#22d98a', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{ok.length}</p>
          </div>
        </div>
        <div style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #ef444433', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={28} color="#ef4444" />
          <div>
            <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Stock Faible</p>
            <p style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{alertes.length}</p>
          </div>
        </div>
        <div style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #D4AF3733', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Package size={28} color="#D4AF37" />
          <div>
            <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0 0 0.2rem', textTransform: 'uppercase' }}>Total Produits</p>
            <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.5rem', margin: 0 }}>{stock.length}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
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
              background: filtre === f ? '#D4AF37' : '#0c1528',
              color: filtre === f ? '#0A1628' : '#9ba8c4',
              textTransform: 'capitalize',
            }}
          >
            {f === 'tous' ? 'Tous' : f === 'faible' ? 'Stock Faible' : 'Stock OK'}
          </button>
        ))}
      </div>

      {/* Table avec barres de progression */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((s) => {
          const isLow = s.stock < s.stockMin
          const pct = getPct(s)
          return (
            <div
              key={s.id}
              style={{
                background: '#0c1528',
                borderRadius: 10,
                padding: '1rem 1.25rem',
                border: `1px solid ${isLow ? '#ef444433' : '#16233d'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <p style={{ color: '#f5f0e8', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{s.nom}</p>
                  <span
                    style={{
                      background: isLow ? 'rgba(239,68,68,0.15)' : 'rgba(34,217,138,0.1)',
                      color: isLow ? '#ef4444' : '#22d98a',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 99,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {isLow ? '⚠ Faible' : '✓ OK'}
                  </span>
                </div>
                <div style={{ background: '#16233d', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: isLow ? '#ef4444' : '#22d98a',
                      borderRadius: 99,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <span style={{ color: '#4e5f82', fontSize: '0.72rem' }}>{s.categorie}</span>
                  <span style={{ color: '#9ba8c4', fontSize: '0.72rem' }}>
                    Min : {s.stockMin} | Stock : <strong style={{ color: isLow ? '#ef4444' : '#22d98a' }}>{s.stock}</strong>
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 110 }}>
                <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0 0 0.15rem', textTransform: 'uppercase' }}>Valeur</p>
                <p style={{ color: '#D4AF37', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                  {s.valeur.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
