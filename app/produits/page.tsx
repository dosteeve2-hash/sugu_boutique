'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react'
import { usePersisted } from '@/lib/storage'
import { Produit } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'

const CATEGORIES = ['Alimentaire', 'Hygiène', 'Boissons', 'Textile', 'Électronique', 'Autre']

const vide: Omit<Produit, 'id'> = {
  nom: '',
  categorie: CATEGORIES[0],
  prixAchat: 0,
  prixVente: 0,
  stock: 0,
  stockMin: 5,
}

export default function Produits() {
  const [produits, setProduits, loaded] = usePersisted<Produit[]>('sugu_produits', [])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Produit | null>(null)
  const [form, setForm] = useState(vide)

  const filtered = produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie.toLowerCase().includes(search.toLowerCase())
  )

  const marge = (p: Produit) =>
    p.prixAchat > 0 ? Math.round(((p.prixVente - p.prixAchat) / p.prixAchat) * 100) : 0

  const ouvrirAjout = () => {
    setEdition(null)
    setForm(vide)
    setShowForm(true)
  }

  const ouvrirEdition = (p: Produit) => {
    setEdition(p)
    setForm({ nom: p.nom, categorie: p.categorie, prixAchat: p.prixAchat, prixVente: p.prixVente, stock: p.stock, stockMin: p.stockMin })
    setShowForm(true)
  }

  const supprimer = (id: number) => {
    if (confirm('Supprimer ce produit ?')) {
      setProduits((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    if (edition) {
      setProduits((prev) => prev.map((p) => (p.id === edition.id ? { ...edition, ...form } : p)))
    } else {
      setProduits((prev) => [...prev, { ...form, id: Date.now() }])
    }
    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <div>
      {/* Header */}
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Produits</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {produits.length} produit{produits.length !== 1 ? 's' : ''} enregistré{produits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={ouvrirAjout}
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

      {produits.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun produit encore"
          message="Ajoutez votre premier produit pour commencer à gérer votre stock."
          actionLabel="Ajouter un produit"
          onAction={ouvrirAjout}
        />
      ) : (
        <>
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
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Table */}
          <div className="sugu-table-wrap" style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
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
                            onClick={() => ouvrirEdition(p)}
                            style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: '#00BCD4' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => supprimer(p.id)}
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
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edition ? 'Modifier le produit' : 'Ajouter un produit'}>
        <form onSubmit={soumettre}>
          <FormField label="Nom du produit">
            <TextInput required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Huile de Palme 5L" />
          </FormField>
          <FormField label="Catégorie">
            <select
              value={form.categorie}
              onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              style={{ width: '100%', background: '#070e1f', border: '1px solid #16233d', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#f5f0e8', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Prix d'achat (FCFA)">
              <TextInput required type="number" min={0} value={form.prixAchat || ''} onChange={(e) => setForm({ ...form, prixAchat: Number(e.target.value) })} />
            </FormField>
            <FormField label="Prix de vente (FCFA)">
              <TextInput required type="number" min={0} value={form.prixVente || ''} onChange={(e) => setForm({ ...form, prixVente: Number(e.target.value) })} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Stock actuel">
              <TextInput required type="number" min={0} value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </FormField>
            <FormField label="Stock minimum">
              <TextInput required type="number" min={0} value={form.stockMin || ''} onChange={(e) => setForm({ ...form, stockMin: Number(e.target.value) })} />
            </FormField>
          </div>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel={edition ? 'Enregistrer' : 'Ajouter'} />
        </form>
      </Modal>
    </div>
  )
}
