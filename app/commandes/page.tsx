'use client'

import { useState } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Plus, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { usePersistedBoutique } from '@/lib/storage'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'

// ─── Types ────────────────────────────────────────────────────────────────────
type StatutCommande = 'En attente' | 'Confirmée' | 'En cours' | 'Livrée' | 'Annulée'

interface LigneCommande { nom: string; qte: number; prix: number }

interface Commande {
  id: number; client: string; produits: LigneCommande[]
  total: number; statut: StatutCommande; date: string
  modePaiement: string; adresseLivraison: string
}

const STATUTS: StatutCommande[] = ['En attente', 'Confirmée', 'En cours', 'Livrée', 'Annulée']

const WORKFLOW: Record<StatutCommande, StatutCommande | null> = {
  'En attente': 'Confirmée', 'Confirmée': 'En cours',
  'En cours': 'Livrée', 'Livrée': null, 'Annulée': null,
}

const SC: Record<StatutCommande, { bg: string; text: string; border: string }> = {
  'En attente': { bg: 'rgba(240,168,50,0.12)',  text: '#f0a832', border: 'rgba(240,168,50,0.3)' },
  'Confirmée':  { bg: 'rgba(0,212,255,0.10)',   text: '#00D4FF', border: 'rgba(0,212,255,0.3)' },
  'En cours':   { bg: 'rgba(167,139,250,0.10)', text: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  'Livrée':     { bg: 'rgba(34,217,138,0.10)',  text: '#22d98a', border: 'rgba(34,217,138,0.3)' },
  'Annulée':    { bg: 'rgba(239,68,68,0.10)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}

const VIDE_FORM = { client: '', modePaiement: 'Espèces', adresseLivraison: '', produit1Nom: '', produit1Qte: 1, produit1Prix: 0 }

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: StatutCommande }) {
  const c = SC[statut]
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 99, whiteSpace: 'nowrap' }}>
      {statut}
    </span>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: '#0c1528', border: '1px solid #16233d', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <span style={{ color: '#7b89a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color, fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ color: '#7b89a8', fontSize: '0.75rem' }}>{sub}</span>}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CommandesPage() {
  const [commandes, setCommandes, loaded] = usePersistedBoutique<Commande[]>('commandes', [])
  const [statutActif, setStatutActif] = useState<StatutCommande | 'Toutes'>('Toutes')
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(VIDE_FORM)

  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.slice(0, 7)

  const commandesDuJour = commandes.filter((c) => c.date === today).length
  const enCours = commandes.filter((c) => c.statut === 'En cours').length
  const livreesMois = commandes.filter((c) => c.statut === 'Livrée' && c.date.startsWith(thisMonth)).length
  const caCommandes = commandes.reduce((s, c) => c.statut !== 'Annulée' ? s + c.total : s, 0)

  const filtered = commandes.filter((c) => statutActif === 'Toutes' || c.statut === statutActif)

  const avancer = (id: number) => {
    setCommandes((prev) => prev.map((c) => {
      if (c.id !== id) return c
      const next = WORKFLOW[c.statut]
      if (!next) return c
      toast.success(`Commande #${id} → ${next}`)
      return { ...c, statut: next }
    }))
    setSelectedCommande((prev) => {
      if (!prev || prev.id !== id) return prev
      const next = WORKFLOW[prev.statut]
      return next ? { ...prev, statut: next } : prev
    })
  }

  const annuler = (id: number) => {
    if (!confirm('Annuler cette commande ?')) return
    setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: 'Annulée' } : c))
    setSelectedCommande((prev) => prev?.id === id ? { ...prev, statut: 'Annulée' } : prev)
    toast.success('Commande annulée')
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client.trim() || !form.produit1Nom.trim()) return
    const newCmd: Commande = {
      id: Date.now(), client: form.client, adresseLivraison: form.adresseLivraison,
      modePaiement: form.modePaiement, statut: 'En attente', date: today,
      produits: [{ nom: form.produit1Nom, qte: form.produit1Qte, prix: form.produit1Prix }],
      total: form.produit1Qte * form.produit1Prix,
    }
    setCommandes((prev) => [newCmd, ...prev])
    toast.success(`Commande #${newCmd.id} créée`)
    setShowForm(false); setForm(VIDE_FORM)
  }

  if (!loaded) return null

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={22} color="#D4AF37" /> Commandes
          </h2>
          <p style={{ color: '#7b89a8', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {commandes.length} commande{commandes.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: '#D4AF37', color: '#0A1628', border: 'none',
          borderRadius: 8, padding: '0.65rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
        }}>
          <Plus size={16} /> Nouvelle commande
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard label="Aujourd&apos;hui" value={commandesDuJour} sub="commandes" color="#00D4FF" />
        <KpiCard label="En cours" value={enCours} sub="en livraison" color="#a78bfa" />
        <KpiCard label="Livrées ce mois" value={livreesMois} sub="commandes" color="#22d98a" />
        <KpiCard label="CA Commandes" value={`${caCommandes.toLocaleString('fr-FR')} F`} sub="hors annulations" color="#D4AF37" />
      </div>

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {(['Toutes', ...STATUTS] as const).map((s) => {
          const active = statutActif === s
          const c = s !== 'Toutes' ? SC[s] : null
          const count = s === 'Toutes' ? commandes.length : commandes.filter((cm) => cm.statut === s).length
          return (
            <button key={s} onClick={() => setStatutActif(s)} style={{
              padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
              border: active ? `1px solid ${c?.border ?? '#D4AF37'}` : '1px solid #16233d',
              background: active ? (c?.bg ?? 'rgba(212,175,55,0.12)') : '#0c1528',
              color: active ? (c?.text ?? '#D4AF37') : '#9ba8c4',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {s}
              <span style={{ background: active ? 'rgba(255,255,255,0.15)' : '#16233d', color: active ? (c?.text ?? '#D4AF37') : '#7b89a8', fontSize: '0.75rem', fontWeight: 700, borderRadius: 99, padding: '0.05rem 0.35rem' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#0c1528', border: '1px solid #16233d', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#07111f' }}>
                {['#', 'Client', 'Produits', 'Total', 'Mode', 'Date', 'Statut', ''].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#7b89a8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#7b89a8', fontSize: '0.9rem' }}>{commandes.length === 0 ? 'Aucune commande enregistrée. Notez ici les commandes à livrer à vos clients.' : 'Aucune commande pour ce filtre.'}</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedCommande(c)}
                      style={{ borderTop: '1px solid #16233d', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0d1a30')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 700, fontSize: '0.82rem' }}>#{c.id}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontSize: '0.85rem', fontWeight: 600 }}>{c.client}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.8rem' }}>
                        {c.produits.slice(0, 2).map((p) => p.nom).join(', ')}
                        {c.produits.length > 2 && ` +${c.produits.length - 2}`}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#22d98a', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.total.toLocaleString('fr-FR')} F</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.8rem' }}>{c.modePaiement}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.date}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><StatutBadge statut={c.statut} /></td>
                      <td style={{ padding: '0.75rem 0.75rem' }}><ChevronRight size={16} color="#7b89a8" /></td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal : Détail commande */}
      <Modal open={!!selectedCommande} onClose={() => setSelectedCommande(null)} title={`Commande #${selectedCommande?.id}`}>
        {selectedCommande && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <StatutBadge statut={selectedCommande.statut} />
              <span style={{ color: '#7b89a8', fontSize: '0.8rem' }}>{selectedCommande.date}</span>
            </div>
            <div style={{ background: '#070e1f', borderRadius: 10, padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p style={{ margin: 0, color: '#7b89a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</p>
              <p style={{ margin: 0, color: '#f5f0e8', fontWeight: 700 }}>{selectedCommande.client}</p>
              <p style={{ margin: 0, color: '#9ba8c4', fontSize: '0.8rem' }}>{selectedCommande.adresseLivraison}</p>
              <p style={{ margin: 0, color: '#9ba8c4', fontSize: '0.8rem' }}>Paiement : {selectedCommande.modePaiement}</p>
            </div>
            <div style={{ background: '#070e1f', borderRadius: 10, padding: '0.85rem' }}>
              <p style={{ margin: '0 0 0.75rem', color: '#7b89a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produits</p>
              {selectedCommande.produits.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: i < selectedCommande.produits.length - 1 ? '1px solid #16233d' : 'none' }}>
                  <span style={{ color: '#f5f0e8', fontSize: '0.85rem' }}>{p.nom} <span style={{ color: '#7b89a8' }}>×{p.qte}</span></span>
                  <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.85rem' }}>{(p.qte * p.prix).toLocaleString('fr-FR')} F</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #16233d' }}>
                <span style={{ color: '#f5f0e8', fontWeight: 700 }}>Total</span>
                <span style={{ color: '#22d98a', fontWeight: 800, fontSize: '1.1rem' }}>{selectedCommande.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            {WORKFLOW[selectedCommande.statut] && (
              <button onClick={() => avancer(selectedCommande.id)} style={{
                width: '100%', padding: '0.75rem', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem',
                background: '#D4AF37', color: '#0A1628', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <ChevronRight size={16} /> Passer à : {WORKFLOW[selectedCommande.statut]}
              </button>
            )}
            {selectedCommande.statut !== 'Annulée' && selectedCommande.statut !== 'Livrée' && (
              <button onClick={() => annuler(selectedCommande.id)} style={{
                width: '100%', padding: '0.6rem', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem',
                background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer',
              }}>
                Annuler la commande
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Modal : Nouvelle commande */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvelle commande">
        <form onSubmit={soumettre}>
          <FormField label="Client">
            <TextInput required value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Nom du client" />
          </FormField>
          <FormField label="Adresse de livraison">
            <TextInput value={form.adresseLivraison} onChange={(e) => setForm({ ...form, adresseLivraison: e.target.value })} placeholder="Secteur, quartier..." />
          </FormField>
          <FormField label="Mode de paiement">
            <select value={form.modePaiement} onChange={(e) => setForm({ ...form, modePaiement: e.target.value })}
              style={{ width: '100%', background: '#070e1f', border: '1px solid #16233d', borderRadius: 8, padding: '0.6rem 0.75rem', color: '#f5f0e8', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            >
              {['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Virement'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </FormField>
          <div style={{ borderTop: '1px solid #16233d', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <p style={{ color: '#7b89a8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>Premier article</p>
            <FormField label="Produit">
              <TextInput required value={form.produit1Nom} onChange={(e) => setForm({ ...form, produit1Nom: e.target.value })} placeholder="Nom du produit" />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField label="Quantité">
                <TextInput required type="number" min={1} value={form.produit1Qte} onChange={(e) => setForm({ ...form, produit1Qte: Number(e.target.value) })} />
              </FormField>
              <FormField label="Prix unitaire (FCFA)">
                <TextInput required type="number" min={0} value={form.produit1Prix || ''} onChange={(e) => setForm({ ...form, produit1Prix: Number(e.target.value) })} />
              </FormField>
            </div>
            {form.produit1Qte > 0 && form.produit1Prix > 0 && (
              <p style={{ color: '#22d98a', fontSize: '0.82rem', margin: '0.25rem 0 0.5rem' }}>
                Total : <strong>{(form.produit1Qte * form.produit1Prix).toLocaleString('fr-FR')} FCFA</strong>
              </p>
            )}
          </div>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel="Créer la commande" />
        </form>
      </Modal>
    </div>
  )
}
