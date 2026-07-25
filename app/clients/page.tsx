'use client'

import { useState } from 'react'
import { Plus, Phone, AlertCircle, CheckCircle } from 'lucide-react'

const mockClients = [
  { id: 1, nom: 'Aminata Diallo', telephone: '+226 70 11 22 33', ville: 'Ouagadougou', soldeDu: 15000, derniereVisite: '2026-07-25', totalAchats: 285000 },
  { id: 2, nom: 'Moussa Traoré', telephone: '+226 76 44 55 66', ville: 'Bobo-Dioulasso', soldeDu: 0, derniereVisite: '2026-07-25', totalAchats: 142000 },
  { id: 3, nom: 'Fatoumata Bah', telephone: '+226 65 77 88 99', ville: 'Ouagadougou', soldeDu: 42000, derniereVisite: '2026-07-24', totalAchats: 510000 },
  { id: 4, nom: 'Idrissa Ouédraogo', telephone: '+226 71 33 44 55', ville: 'Koudougou', soldeDu: 0, derniereVisite: '2026-07-24', totalAchats: 98000 },
  { id: 5, nom: 'Mariam Kaboré', telephone: '+226 60 22 11 44', ville: 'Ouagadougou', soldeDu: 27500, derniereVisite: '2026-07-23', totalAchats: 340000 },
]

export default function Clients() {
  const [clients] = useState(mockClients)
  const totalSoldeDu = clients.reduce((a, c) => a + c.soldeDu, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Clients</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {clients.length} clients •{' '}
            <span style={{ color: '#ef4444' }}>
              {totalSoldeDu.toLocaleString('fr-FR')} FCFA à recouvrer
            </span>
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
          <Plus size={16} /> Ajouter un Client
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Clients', value: clients.length, color: '#00BCD4' },
          { label: 'Clients Soldés', value: clients.filter(c => c.soldeDu === 0).length, color: '#22d98a' },
          { label: 'Clients avec Crédit', value: clients.filter(c => c.soldeDu > 0).length, color: '#ef4444' },
        ].map((k) => (
          <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
            <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ color: k.color, fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#070e1f' }}>
              {['Client', 'Téléphone', 'Ville', 'Total Achats', 'Solde Dû', 'Dernière Visite'].map((h) => (
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
            {clients.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #16233d' }}>
                <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 600 }}>{c.nom}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ba8c4', fontSize: '0.875rem' }}>
                    <Phone size={13} /> {c.telephone}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{c.ville}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 600, fontSize: '0.875rem' }}>
                  {c.totalAchats.toLocaleString('fr-FR')} FCFA
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {c.soldeDu > 0 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 700 }}>
                      <AlertCircle size={14} /> {c.soldeDu.toLocaleString('fr-FR')} FCFA
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#22d98a', fontWeight: 600 }}>
                      <CheckCircle size={14} /> Soldé
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{c.derniereVisite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
