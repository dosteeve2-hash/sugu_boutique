'use client'

import { useState } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'

const mockVentes = [
  { id: 1001, client: 'Aminata Diallo', total: 45000, date: '2026-07-25', produits: 3, statut: 'Payé' },
  { id: 1002, client: 'Moussa Traoré', total: 22000, date: '2026-07-25', produits: 1, statut: 'Payé' },
  { id: 1003, client: 'Fatoumata Bah', total: 78500, date: '2026-07-24', produits: 5, statut: 'Crédit' },
  { id: 1004, client: 'Idrissa Ouédraogo', total: 15000, date: '2026-07-24', produits: 2, statut: 'Payé' },
  { id: 1005, client: 'Mariam Kaboré', total: 33000, date: '2026-07-23', produits: 4, statut: 'Crédit' },
]

const totalJour = mockVentes
  .filter((v) => v.date === '2026-07-25')
  .reduce((acc, v) => acc + v.total, 0)

export default function Ventes() {
  const [ventes] = useState(mockVentes)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Ventes</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Aujourd&apos;hui : <span style={{ color: '#22d98a', fontWeight: 600 }}>{totalJour.toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#D4AF37',
            color: '#0A1628',
            border: 'none',
            borderRadius: 8,
            padding: '0.65rem 1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          <Plus size={16} /> Nouvelle Vente
        </button>
      </div>

      {/* KPI rapide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Ventes', value: ventes.reduce((a, v) => a + v.total, 0), color: '#D4AF37', suffix: 'FCFA' },
          { label: 'Ventes Payées', value: ventes.filter(v => v.statut === 'Payé').length, color: '#22d98a', suffix: 'transactions' },
          { label: 'Ventes à Crédit', value: ventes.filter(v => v.statut === 'Crédit').length, color: '#ef4444', suffix: 'transactions' },
        ].map((k) => (
          <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
            <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ color: k.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
              {typeof k.value === 'number' && k.suffix === 'FCFA'
                ? k.value.toLocaleString('fr-FR')
                : k.value}{' '}
              <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{k.suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#070e1f' }}>
              {['#', 'Client', 'Montant', 'Produits', 'Statut', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    color: '#4e5f82',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id} style={{ borderTop: '1px solid #16233d' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#4e5f82', fontSize: '0.8rem' }}>#{v.id}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 500 }}>{v.client}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 700 }}>
                  {v.total.toLocaleString('fr-FR')} FCFA
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShoppingCart size={14} /> {v.produits}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      background: v.statut === 'Payé' ? 'rgba(34,217,138,0.1)' : 'rgba(239,68,68,0.1)',
                      color: v.statut === 'Payé' ? '#22d98a' : '#ef4444',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 99,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {v.statut}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{v.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
