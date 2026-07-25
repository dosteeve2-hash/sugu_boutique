'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const mockAchats = [
  { id: 1, fournisseur: 'SOBTRA Distribution', produit: 'Farine de Blé 50kg', quantite: 20, prixUnit: 18000, total: 360000, date: '2026-07-24', statut: 'Livré' },
  { id: 2, fournisseur: 'Agro-Sahel SARL', produit: 'Huile de Palme 5L', quantite: 50, prixUnit: 3500, total: 175000, date: '2026-07-23', statut: 'Livré' },
  { id: 3, fournisseur: 'SOBTRA Distribution', produit: 'Sucre Cristallisé 25kg', quantite: 30, prixUnit: 12500, total: 375000, date: '2026-07-22', statut: 'En attente' },
  { id: 4, fournisseur: 'Agro-Sahel SARL', produit: 'Riz Parfumé 50kg', quantite: 15, prixUnit: 22000, total: 330000, date: '2026-07-20', statut: 'Livré' },
]

export default function Achats() {
  const [achats] = useState(mockAchats)
  const totalDepenses = achats.reduce((a, c) => a + c.total, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Achats</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Total dépensé : <span style={{ color: '#9ba8c4', fontWeight: 600 }}>{totalDepenses.toLocaleString('fr-FR')} FCFA</span>
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
          <Plus size={16} /> Nouvel Achat
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Dépensé', value: `${totalDepenses.toLocaleString('fr-FR')} FCFA`, color: '#9ba8c4' },
          { label: 'Commandes Livrées', value: `${achats.filter(a => a.statut === 'Livré').length}`, color: '#22d98a' },
          { label: 'En Attente', value: `${achats.filter(a => a.statut === 'En attente').length}`, color: '#f0a832' },
        ].map((k) => (
          <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
            <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ color: k.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#070e1f' }}>
              {['Fournisseur', 'Produit', 'Qté', 'Prix Unit.', 'Total', 'Statut', 'Date'].map((h) => (
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
            {achats.map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid #16233d' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 500 }}>{a.fournisseur}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4' }}>{a.produit}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#00BCD4', fontWeight: 600 }}>{a.quantite}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>
                  {a.prixUnit.toLocaleString('fr-FR')} FCFA
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 700 }}>
                  {a.total.toLocaleString('fr-FR')} FCFA
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      background: a.statut === 'Livré' ? 'rgba(34,217,138,0.1)' : 'rgba(240,168,50,0.1)',
                      color: a.statut === 'Livré' ? '#22d98a' : '#f0a832',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 99,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {a.statut}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
