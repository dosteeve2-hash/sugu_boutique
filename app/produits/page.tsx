'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Package, Filter } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'
import { fadeInUp, staggerContainer } from '@/lib/animations'

const CATEGORIES = ['Alimentaire', 'Hygiène', 'Boissons', 'Textile', 'Électronique', 'Autre']

const vide: Omit<Produit, 'id'> = {
  nom: '',
  categorie: CATEGORIES[0],
  prixAchat: 0,
  prixVente: 0,
  stock: 0,
  stockMin: 5,
  unite: '',
}

export default function Produits() {
  const [produits, setProduits, loaded] = usePersistedBoutique<Produit[]>('produits', [])
  const [search, setSearch] = useState('')
  const [categorieFiltre, setCategorieFiltre] = useState<string>('Toutes')
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Produit | null>(null)
  const [form, setForm] = useState(vide)

  // Catégories présentes dans le catalogue
  const categoriesDisponibles = useMemo(
    () => ['Toutes', ...Array.from(new Set(produits.map((p) => p.categorie))).sort()],
    [produits]
  )

  const filtered = useMemo(
    () =>
      produits.filter((p) => {
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          p.nom.toLowerCase().includes(q) ||
          p.categorie.toLowerCase().includes(q) ||
          String(p.id).includes(q)
        const matchCat = categorieFiltre === 'Toutes' || p.categorie === categorieFiltre
        return matchSearch && matchCat
      }),
    [produits, search, categorieFiltre]
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
    setForm({ nom: p.nom, categorie: p.categorie, prixAchat: p.prixAchat, prixVente: p.prixVente, stock: p.stock, stockMin: p.stockMin, unite: p.unite ?? '' })
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
            {filtered.length !== produits.length && (
              <span style={{ color: '#00BCD4' }}> — {filtered.length} affiché{filtered.length !== 1 ? 's' : ''}</span>
            )}
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
          {/* Recherche + Filtres */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {/* Barre de recherche */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#4e5f82' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, catégorie, ID..."
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

            {/* Filtre catégorie */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="#4e5f82" />
              <select
                value={categorieFiltre}
                onChange={(e) => setCategorieFiltre(e.target.value)}
                style={{
                  background: '#0c1528',
                  border: '1px solid #16233d',
                  borderRadius: 8,
                  padding: '0.6rem 0.75rem',
                  color: categorieFiltre === 'Toutes' ? '#4e5f82' : '#D4AF37',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {categoriesDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
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
              <motion.tbody
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filtered.map((p) => {
                  const isLow = p.stock < p.stockMin
                  return (
                    <motion.tr
                      key={p.id}
                      variants={fadeInUp}
                      style={{ borderTop: '1px solid #16233d' }}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 500 }}>
                        {p.nom}
                        {isLow && (
                          <span style={{
                            marginLeft: '0.5rem',
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: 99,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.4rem',
                            verticalAlign: 'middle',
                          }}>
                            FAIBLE
                          </span>
                        )}
                      </td>
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
                    </motion.tr>
                  )
                })}
              </motion.tbody>
            </table>
            {filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#4e5f82', padding: '2rem' }}>
                {search || categorieFiltre !== 'Toutes'
                  ? 'Aucun produit trouvé pour cette recherche.'
                  : 'Aucun produit dans le catalogue.'}
              </p>
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
          <FormField label="Unité (kg, sac, pièce...)">
            <TextInput value={form.unite ?? ''} onChange={(e) => setForm({ ...form, unite: e.target.value })} placeholder="Ex: kg, tas, pièce" />
          </FormField>
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
