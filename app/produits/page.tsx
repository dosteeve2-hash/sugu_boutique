'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

const initialProduits = [
  { id: 1, nom: 'Huile de Palme 5L', categorie: 'Alimentaire', prixAchat: 3500, prixVente: 4200, stock: 45, stockMin: 10 },
  { id: 2, nom: 'Farine de Blé 50kg', categorie: 'Alimentaire', prixAchat: 18000, prixVente: 22000, stock: 8, stockMin: 15 },
  { id: 3, nom: 'Savon Lux x12', categorie: 'Hygiène', prixAchat: 2800, prixVente: 3600, stock: 60, stockMin: 20 },
  { id: 4, nom: 'Sucre Cristallisé 25kg', categorie: 'Alimentaire', prixAchat: 12500, prixVente: 15000, stock: 3, stockMin: 10 },
  { id: 5, nom: 'Riz Parfumé 50kg', categorie: 'Alimentaire', prixAchat: 22000, prixVente: 25000, stock: 22, stockMin: 8 },
  { id: 6, nom: 'Lait en Poudre 900g', categorie: 'Alimentaire', prixAchat: 4500, prixVente: 5500, stock: 18, stockMin: 12 },
  { id: 7, nom: 'Eau de Javel 1L', categorie: 'Hygiène', prixAchat: 350, prixVente: 500, stock: 80, stockMin: 30 },
]

export default function Produits() {
  const [produits] = useState(initialProduits)
  const [search, setSearch] = useState('')

  const filtered = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
  )

  const marge = (p: (typeof produits)[0]) =>
    Math.round(((p.prixVente - p.prixAchat) / p.prixAchat) * 100)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Produits</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{produits.length} produits enregistrés</p>
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
          <Plus size={16} /> Ajouter un Produit
        </button>
      </div>

      {/* Recherche */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4e5f82' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          style={{
            width: '100%',
            background: '#0c1528',
            border: '1px solid #16233d',
            borderRadius: 8,
            padding: '0.6rem 0.75rem 0.6rem 2.25rem',
            color: '#f5f0e8',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#070e1f' }}>
              {['Produit', 'Catégorie', 'Prix Achat', 'Prix Vente', 'Marge', 'Stock', 'Min', 'Actions'].map((h) => (
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
            {filtered.map((p) => {
              const isLow = p.stock < p.stockMin
              return (
                <tr key={p.id} style={{ borderTop: '1px solid #16233d' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 500 }}>{p.nom}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        background: 'rgba(212,175,55,0.1)',
                        color: '#D4AF37',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 99,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {p.categorie}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>
                    {p.prixAchat.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 600, fontSize: '0.875rem' }}>
                    {p.prixVente.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: '#22d98a', fontSize: '0.875rem', fontWeight: 600 }}>{marge(p)}%</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: isLow ? '#ef4444' : '#22d98a', fontWeight: 700, fontSize: '0.875rem' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#4e5f82', fontSize: '0.875rem' }}>{p.stockMin}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: '#00BCD4' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#4e5f82', padding: '2rem' }}>Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  )
}
