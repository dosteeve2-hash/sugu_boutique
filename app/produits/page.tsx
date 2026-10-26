'use client'

import { useState } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Package, Edit2, Trash2, AlertTriangle, RefreshCw, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { usePersistedBoutique } from '@/lib/storage'
import { Produit } from '@/lib/types'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'

// ─── Catégories ───────────────────────────────────────────────────────────────
const CATEGORIES = ['Tous', 'Alimentaire', 'Hygiène', 'Boissons', 'Divers'] as const
type Categorie = (typeof CATEGORIES)[number]

const CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Alimentaire: { bg: 'rgba(227,160,15,0.12)', text: '#E3A00F', dot: '#E3A00F' },
  Hygiène:     { bg: 'rgba(0,212,255,0.10)',  text: '#00D4FF', dot: '#00D4FF' },
  Boissons:    { bg: 'rgba(145,217,163,0.10)', text: '#91D9A3', dot: '#91D9A3' },
  Divers:      { bg: 'rgba(167,139,250,0.10)',text: '#a78bfa', dot: '#a78bfa' },
}

const CAT_BG: Record<string, string> = {
  Alimentaire: 'linear-gradient(135deg,#3d2a00 0%,#1a1200 100%)',
  Hygiène:     'linear-gradient(135deg,#003d4d 0%,#001a21 100%)',
  Boissons:    'linear-gradient(135deg,#003d1e 0%,#001a0d 100%)',
  Divers:      'linear-gradient(135deg,#2d1a5c 0%,#110a26 100%)',
}

const QUICK_RESTOCK = [10, 25, 50]

const vide: Omit<Produit, 'id'> = {
  nom: '', categorie: 'Alimentaire', prixAchat: 0, prixVente: 0, stock: 0, stockMin: 5, unite: '',
}

// ─── Composant Card ────────────────────────────────────────────────────────────
function ProduitCard({ p, index, onEdit, onDelete, onModifStock }: {
  p: Produit; index: number
  onEdit: (p: Produit) => void
  onDelete: (id: number) => void
  onModifStock: (p: Produit) => void
}) {
  const isCritique = p.stock === 0 || p.stock <= 2
  const isBas = !isCritique && p.stock < p.stockMin
  const cat = CAT_COLORS[p.categorie] ?? CAT_COLORS['Divers']
  const catBg = CAT_BG[p.categorie] ?? CAT_BG['Divers']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 11) * 0.04 }}
      style={{
        background: '#263F30', borderRadius: 14,
        border: `1px solid ${(isCritique || isBas) ? '#ef444444' : '#496653'}`,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: 110, background: catBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={40} color={cat.dot} style={{ opacity: 0.45 }} />
        {(isCritique || isBas) && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: isCritique ? '#ef4444' : '#E3A00F',
            color: '#fff', fontSize: '0.75rem', fontWeight: 700,
            padding: '0.2rem 0.55rem', borderRadius: 99,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <AlertTriangle size={11} />
            {isCritique ? 'Critique' : '⚠ Stock faible'}
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: cat.bg, color: cat.text,
          fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99,
        }}>
          {p.categorie}
        </div>
        {(isCritique || isBas) && (
          <button
            onClick={(e) => { e.stopPropagation(); onModifStock(p) }}
            style={{
              position: 'absolute', bottom: 10, right: 10,
              background: '#E3A00F', color: '#1F3A2B', border: 'none',
              borderRadius: 99, width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            }}
            title="Réapprovisionner rapidement"
            aria-label={`Ajouter du stock : ${p.nom}`}
          >
            +
          </button>
        )}
      </div>

      <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p style={{ color: '#F2EBCF', fontWeight: 700, fontSize: '0.88rem', margin: 0, lineHeight: 1.3 }}>{p.nom}</p>
        <p style={{ color: '#E3A00F', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
          {p.prixVente.toLocaleString('fr-FR')} FCFA
          {p.unite && <span style={{ color: '#B7C5AE', fontWeight: 400, fontSize: '0.75rem' }}> / {p.unite}</span>}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#B7C5AE', fontSize: '0.75rem' }}>Stock :</span>
          <span style={{ color: isCritique ? '#ef4444' : isBas ? '#E3A00F' : '#91D9A3', fontWeight: 700, fontSize: '0.85rem' }}>
            {p.stock} {p.unite ?? ''}
          </span>
          <span style={{ color: '#B7C5AE', fontSize: '0.75rem' }}>/ seuil {p.stockMin}</span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #496653', padding: '0.65rem 0.9rem', display: 'flex', gap: '0.4rem' }}>
        <button
          onClick={() => onModifStock(p)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 7, padding: '0.4rem', color: '#00D4FF',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} /> Stock
        </button>
        <button onClick={() => onEdit(p)} aria-label={`Modifier ${p.nom}`} style={{ background: 'rgba(227,160,15,0.08)', border: '1px solid rgba(227,160,15,0.2)', borderRadius: 7, padding: '0.4rem 0.6rem', minWidth: 48, color: '#E3A00F', cursor: 'pointer' }}>
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(p.id)} aria-label={`Supprimer ${p.nom}`} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '0.4rem 0.6rem', minWidth: 48, color: '#ef4444', cursor: 'pointer' }}>
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function ProduitsPage() {
  const [produits, setProduits, loaded] = usePersistedBoutique<Produit[]>('produits', [])
  const [search, setSearch] = useState('')
  const [catActive, setCatActive] = useState<Categorie>('Tous')
  const [alertesSeul, setAlertesSeul] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Produit | null>(null)
  const [form, setForm] = useState(vide)
  const [modifStockProduit, setModifStockProduit] = useState<Produit | null>(null)
  const [deltaStock, setDeltaStock] = useState<string>('')
  const [showAlerteBanner, setShowAlerteBanner] = useState(true)

  const produitsFaibles = produits.filter((p) => p.stock <= p.stockMin)

  const filtered = produits.filter((p) => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || p.categorie.toLowerCase().includes(search.toLowerCase())
    const matchCat = catActive === 'Tous' || p.categorie === catActive
    const matchAlerte = !alertesSeul || p.stock <= p.stockMin
    return matchSearch && matchCat && matchAlerte
  })

  const ouvrirAjout = () => { setEdition(null); setForm(vide); setShowForm(true) }

  const ouvrirEdition = (p: Produit) => {
    setEdition(p)
    setForm({ nom: p.nom, categorie: p.categorie, prixAchat: p.prixAchat, prixVente: p.prixVente, stock: p.stock, stockMin: p.stockMin, unite: p.unite ?? '' })
    setShowForm(true)
  }

  const supprimer = (id: number) => {
    if (confirm('Supprimer ce produit ?')) {
      setProduits((prev) => prev.filter((p) => p.id !== id))
      toast.success('Produit supprimé')
    }
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    if (edition) {
      setProduits((prev) => prev.map((p) => p.id === edition.id ? { ...edition, ...form } : p))
      toast.success(`${form.nom} mis à jour`)
    } else {
      setProduits((prev) => [...prev, { ...form, id: Date.now() }])
      toast.success(`${form.nom} ajouté au catalogue`)
    }
    setShowForm(false)
  }

  const ouvrirModifStock = (p: Produit) => { setModifStockProduit(p); setDeltaStock('') }

  const appliquerQuickRestock = (batch: number) => {
    if (!modifStockProduit) return
    const newStock = modifStockProduit.stock + batch
    setProduits((prev) => prev.map((p) => p.id === modifStockProduit.id ? { ...p, stock: newStock } : p))
    toast.success(`+${batch} ${modifStockProduit.unite ?? ''} → stock : ${newStock}`)
    setModifStockProduit(null)
  }

  const soumettreModifStock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modifStockProduit) return
    const delta = parseInt(deltaStock)
    if (isNaN(delta)) return
    const newStock = Math.max(0, modifStockProduit.stock + delta)
    setProduits((prev) => prev.map((p) => p.id === modifStockProduit.id ? { ...p, stock: newStock } : p))
    toast.success(`Stock mis à jour : ${newStock} ${modifStockProduit.unite ?? ''}`)
    setModifStockProduit(null)
  }

  const formulaireProduit = (
      <Modal open={showForm} onClose={() => setShowForm(false)} title={edition ? 'Modifier le produit' : 'Ajouter un produit'}>
        <form onSubmit={soumettre}>
          <FormField label="Nom du produit">
            <TextInput required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Huile de Palme 5L" />
          </FormField>
          <FormField label="Catégorie">
            <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}
              style={{ width: '100%', background: '#1F3A2B', border: '1px solid #496653', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#F2EBCF', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            >
              {['Alimentaire', 'Hygiène', 'Boissons', 'Divers', 'Textile', 'Électronique', 'Autre'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Prix achat (FCFA)">
              <TextInput required type="number" min={0} value={form.prixAchat || ''} onChange={(e) => setForm({ ...form, prixAchat: Number(e.target.value) })} />
            </FormField>
            <FormField label="Prix vente (FCFA)">
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
            <FormField label="Seuil d&apos;alerte">
              <TextInput required type="number" min={0} value={form.stockMin || ''} onChange={(e) => setForm({ ...form, stockMin: Number(e.target.value) })} />
            </FormField>
          </div>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel={edition ? 'Enregistrer' : 'Ajouter'} />
        </form>
      </Modal>
  )

  if (!loaded) return null

  if (produits.length === 0) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#263F30', border: '1px solid #496653', borderRadius: 16 }}>
          <Package size={48} color="#E3A00F" style={{ opacity: 0.7, marginBottom: '1rem' }} />
          <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Catalogue Produits</h2>
          <p style={{ color: '#D9DEC9', fontSize: '1rem', lineHeight: 1.5, margin: '0 auto 1.5rem', maxWidth: 360 }}>
            Votre catalogue est vide. Ajoutez le premier produit que vous vendez : son nom, son prix, et combien vous en avez.
          </p>
          <button
            onClick={ouvrirAjout}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              width: '100%', maxWidth: 360, minHeight: 64,
              background: '#E3A00F', color: '#1F3A2B', border: 'none', borderRadius: 14,
              fontWeight: 800, cursor: 'pointer', fontSize: '1.15rem',
            }}
          >
            <Plus size={22} /> Ajoutez votre premier produit
          </button>
        </div>
        {formulaireProduit}
      </div>
    )
  }

  return (
    <div>
      {/* Bannière alertes stock */}
      {showAlerteBanner && produitsFaibles.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
        }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 0.4rem' }}>
              {produitsFaibles.length} produit{produitsFaibles.length > 1 ? 's' : ''} en rupture ou stock faible
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {produitsFaibles.map((p) => (
                <span key={p.id} style={{
                  background: p.stock === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(227,160,15,0.15)',
                  color: p.stock === 0 ? '#ef4444' : '#E3A00F',
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99,
                }}>
                  {p.nom} ({p.stock === 0 ? 'Rupture' : `${p.stock}/${p.stockMin}`})
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setShowAlerteBanner(false)} aria-label="Fermer l'alerte" style={{ background: 'none', border: 'none', color: '#B7C5AE', cursor: 'pointer', fontSize: '1.4rem', padding: 0, width: 44, height: 44, flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Catalogue Produits</h2>
          <p style={{ color: '#B7C5AE', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {produits.length} produit{produits.length !== 1 ? 's' : ''}
            {produitsFaibles.length > 0 && (
              <span style={{ color: '#E3A00F', marginLeft: 8 }}>· {produitsFaibles.length} en alerte stock</span>
            )}
          </p>
        </div>
        <button
          onClick={ouvrirAjout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#E3A00F', color: '#1F3A2B', border: 'none',
            borderRadius: 8, padding: '0.65rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
          }}
        >
          <Plus size={16} /> Ajouter produit
        </button>
      </div>

      {/* Recherche + Filtres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B7C5AE' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            style={{ width: '100%', background: '#263F30', border: '1px solid #496653', borderRadius: 8, padding: '0.6rem 0.75rem 0.6rem 2.25rem', color: '#F2EBCF', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const active = catActive === cat && !alertesSeul
            const cc = cat !== 'Tous' ? CAT_COLORS[cat] : null
            return (
              <button key={cat} onClick={() => { setCatActive(cat); setAlertesSeul(false) }} style={{
                padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
                border: active ? `1px solid ${cc?.dot ?? '#E3A00F'}` : '1px solid #496653',
                background: active ? (cc?.bg ?? 'rgba(227,160,15,0.12)') : '#263F30',
                color: active ? (cc?.text ?? '#E3A00F') : '#D9DEC9',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {cat}
              </button>
            )
          })}
          <button
            onClick={() => setAlertesSeul((v) => !v)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
              border: alertesSeul ? '1px solid #ef4444' : '1px solid #496653',
              background: alertesSeul ? 'rgba(239,68,68,0.12)' : '#263F30',
              color: alertesSeul ? '#ef4444' : '#D9DEC9',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <AlertTriangle size={12} />
            Alertes seulement
            {produitsFaibles.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, padding: '0.05rem 0.35rem', marginLeft: 2 }}>
                {produitsFaibles.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grille */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#B7C5AE', textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' }}>
            Aucun produit trouvé.
          </motion.p>
        ) : (
          <motion.div key="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {filtered.map((p, i) => (
              <ProduitCard key={p.id} p={p} index={i} onEdit={ouvrirEdition} onDelete={supprimer} onModifStock={ouvrirModifStock} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {formulaireProduit}

      {/* Modal : Modifier stock */}
      <Modal open={!!modifStockProduit} onClose={() => setModifStockProduit(null)} title="Modifier le stock">
        {modifStockProduit && (
          <div>
            <p style={{ color: '#D9DEC9', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <strong style={{ color: '#F2EBCF' }}>{modifStockProduit.nom}</strong><br />
              Stock actuel : <span style={{ color: '#E3A00F', fontWeight: 700 }}>{modifStockProduit.stock} {modifStockProduit.unite ?? ''}</span>
            </p>
            {/* Quick restock */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ color: '#B7C5AE', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', marginTop: 0 }}>
                Réapprovisionnement rapide
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {QUICK_RESTOCK.map((batch) => (
                  <button key={batch} onClick={() => appliquerQuickRestock(batch)} style={{
                    flex: 1, padding: '0.65rem', borderRadius: 8, fontWeight: 700,
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
                    color: '#00D4FF', cursor: 'pointer', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <Zap size={13} /> +{batch}
                  </button>
                ))}
              </div>
            </div>
            {/* Variation manuelle */}
            <div style={{ borderTop: '1px solid #496653', paddingTop: '1rem' }}>
              <form onSubmit={soumettreModifStock}>
                <FormField label="Variation manuelle (+ réception / − sortie)">
                  <TextInput required type="number" value={deltaStock} onChange={(e) => setDeltaStock(e.target.value)} placeholder="Ex: +20 ou -5" />
                </FormField>
                {deltaStock !== '' && !isNaN(parseInt(deltaStock)) && (
                  <p style={{ color: '#00D4FF', fontSize: '0.82rem', margin: '0.5rem 0 1rem' }}>
                    Nouveau stock : <strong>{Math.max(0, modifStockProduit.stock + parseInt(deltaStock))} {modifStockProduit.unite ?? ''}</strong>
                  </p>
                )}
                <SubmitRow onCancel={() => setModifStockProduit(null)} submitLabel="Confirmer" />
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
