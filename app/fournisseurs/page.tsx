'use client'

import { useState } from 'react'
import { m as motion } from 'framer-motion'
import { Plus, Phone, MapPin, Edit2, Trash2, Building2 } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Fournisseur } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'

const vide: Omit<Fournisseur, 'id'> = {
  nom: '',
  contact: '',
  ville: '',
  produits: '',
  totalAchats: 0,
  derniereCommande: '—',
}

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs, loaded] = usePersistedBoutique<Fournisseur[]>('fournisseurs', [])
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Fournisseur | null>(null)
  const [form, setForm] = useState(vide)

  const ouvrirAjout = () => {
    setEdition(null)
    setForm(vide)
    setShowForm(true)
  }

  const ouvrirEdition = (f: Fournisseur) => {
    setEdition(f)
    setForm({ nom: f.nom, contact: f.contact, ville: f.ville, produits: f.produits, totalAchats: f.totalAchats, derniereCommande: f.derniereCommande })
    setShowForm(true)
  }

  const supprimer = (id: number) => {
    if (confirm('Supprimer ce fournisseur ?')) {
      setFournisseurs((prev) => prev.filter((f) => f.id !== id))
    }
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    if (edition) {
      setFournisseurs((prev) => prev.map((f) => (f.id === edition.id ? { ...edition, ...form } : f)))
    } else {
      setFournisseurs((prev) => [...prev, { ...form, id: Date.now() }])
    }
    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <div>
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Fournisseurs</h2>
          <p style={{ color: '#7b89a8', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {fournisseurs.length} fournisseur{fournisseurs.length !== 1 ? 's' : ''} partenaire{fournisseurs.length !== 1 ? 's' : ''}
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
          <Plus size={16} /> Ajouter Fournisseur
        </button>
      </div>

      {fournisseurs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun fournisseur encore"
          message="Ajoutez votre premier fournisseur pour suivre vos approvisionnements."
          actionLabel="Ajouter un fournisseur"
          onAction={ouvrirAjout}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {fournisseurs.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.05 }}
              style={{
                background: '#0c1528',
                borderRadius: 12,
                padding: '1.25rem',
                border: '1px solid #16233d',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ color: '#f5f0e8', fontWeight: 700, margin: 0, fontSize: '1rem' }}>{f.nom}</h3>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => ouvrirEdition(f)}
                    aria-label={`Modifier ${f.nom}`}
                    style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 8, padding: '0.3rem', minWidth: 48, cursor: 'pointer', color: '#00BCD4' }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => supprimer(f.id)}
                    aria-label={`Supprimer ${f.nom}`}
                    style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '0.3rem', minWidth: 48, cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ba8c4', fontSize: '0.85rem', margin: 0 }}>
                  <Phone size={13} /> {f.contact || '—'}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ba8c4', fontSize: '0.85rem', margin: 0 }}>
                  <MapPin size={13} /> {f.ville || '—'}
                </p>
              </div>

              <div style={{ background: '#070e1f', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' }}>
                <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Produits fournis</p>
                <p style={{ color: '#00BCD4', fontSize: '0.82rem', margin: 0 }}>{f.produits || '—'}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Total Achats</p>
                  <p style={{ color: '#D4AF37', fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>
                    {f.totalAchats.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.1rem', textTransform: 'uppercase' }}>Dernière Commande</p>
                  <p style={{ color: '#9ba8c4', fontSize: '0.82rem', margin: 0 }}>{f.derniereCommande}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edition ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}>
        <form onSubmit={soumettre}>
          <FormField label="Nom">
            <TextInput required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: SOBTRA Distribution" />
          </FormField>
          <FormField label="Contact">
            <TextInput value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Ex: +226 25 33 44 55" />
          </FormField>
          <FormField label="Ville">
            <TextInput value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} placeholder="Ex: Ouagadougou" />
          </FormField>
          <FormField label="Produits fournis">
            <TextInput value={form.produits} onChange={(e) => setForm({ ...form, produits: e.target.value })} placeholder="Ex: Farine, Sucre, Riz" />
          </FormField>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel={edition ? 'Enregistrer' : 'Ajouter'} />
        </form>
      </Modal>
    </div>
  )
}
