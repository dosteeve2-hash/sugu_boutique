'use client'

import { useState } from 'react'
import { Plus, Phone, MapPin } from 'lucide-react'

const mockFournisseurs = [
  {
    id: 1,
    nom: 'SOBTRA Distribution',
    contact: '+226 25 33 44 55',
    ville: 'Ouagadougou',
    produits: 'Farine, Sucre, Riz, Sel',
    totalAchats: 1200000,
    derniereCommande: '2026-07-24',
  },
  {
    id: 2,
    nom: 'Agro-Sahel SARL',
    contact: '+226 70 88 99 00',
    ville: 'Bobo-Dioulasso',
    produits: 'Huile, Arachide, Soja',
    totalAchats: 875000,
    derniereCommande: '2026-07-23',
  },
  {
    id: 3,
    nom: 'Hygiène Plus BF',
    contact: '+226 65 11 22 33',
    ville: 'Ouagadougou',
    produits: 'Savon, Eau de Javel, Détergent',
    totalAchats: 345000,
    derniereCommande: '2026-07-18',
  },
]

export default function Fournisseurs() {
  const [fournisseurs] = useState(mockFournisseurs)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Fournisseurs</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{fournisseurs.length} fournisseurs partenaires</p>
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
          <Plus size={16} /> Ajouter Fournisseur
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {fournisseurs.map((f) => (
          <div
            key={f.id}
            style={{
              background: '#0c1528',
              borderRadius: 12,
              padding: '1.25rem',
              border: '1px solid #16233d',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ color: '#f5f0e8', fontWeight: 700, margin: 0, fontSize: '1rem' }}>{f.nom}</h3>
              <span
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  color: '#D4AF37',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 99,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                Partenaire
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ba8c4', fontSize: '0.85rem', margin: 0 }}>
                <Phone size={13} /> {f.contact}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ba8c4', fontSize: '0.85rem', margin: 0 }}>
                <MapPin size={13} /> {f.ville}
              </p>
            </div>

            <div style={{ background: '#070e1f', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' }}>
              <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Produits fournis</p>
              <p style={{ color: '#00BCD4', fontSize: '0.82rem', margin: 0 }}>{f.produits}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Total Achats</p>
                <p style={{ color: '#D4AF37', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
                  {f.totalAchats.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#4e5f82', fontSize: '0.7rem', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Dernière Commande</p>
                <p style={{ color: '#9ba8c4', fontSize: '0.82rem', margin: 0 }}>{f.derniereCommande}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
