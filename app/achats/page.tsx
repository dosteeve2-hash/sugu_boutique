'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Truck } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Achat, Produit, Fournisseur } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SelectInput, SubmitRow } from '@/components/FormField'

export default function Achats() {
  const [achats, setAchats, loaded] = usePersistedBoutique<Achat[]>('achats', [])
  const [produits, setProduits] = usePersistedBoutique<Produit[]>('produits', [])
  const [fournisseurs, setFournisseurs] = usePersistedBoutique<Fournisseur[]>('fournisseurs', [])
  const [showForm, setShowForm] = useState(false)

  const [fournisseurId, setFournisseurId] = useState<number | ''>('')
  const [produitId, setProduitId] = useState<number | ''>('')
  const [quantite, setQuantite] = useState(1)
  const [prixUnit, setPrixUnit] = useState(0)
  const [statut, setStatut] = useState<'Livré' | 'En attente'>('Livré')

  const totalDepenses = achats.reduce((a, c) => a + c.total, 0)
  const peutAjouter = produits.length > 0 && fournisseurs.length > 0

  const ouvrirAjout = () => {
    setFournisseurId(fournisseurs[0]?.id ?? '')
    setProduitId(produits[0]?.id ?? '')
    setPrixUnit(produits[0]?.prixAchat ?? 0)
    setQuantite(1)
    setStatut('Livré')
    setShowForm(true)
  }

  const onProduitChange = (id: number) => {
    setProduitId(id)
    const p = produits.find((pr) => pr.id === id)
    if (p) setPrixUnit(p.prixAchat)
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fournisseurId || !produitId || quantite <= 0) return
    const fournisseur = fournisseurs.find((f) => f.id === fournisseurId)
    const produit = produits.find((p) => p.id === produitId)
    if (!fournisseur || !produit) return

    const total = quantite * prixUnit
    const today = new Date().toISOString().slice(0, 10)

    const achat: Achat = {
      id: Date.now(),
      fournisseurId: fournisseur.id,
      fournisseur: fournisseur.nom,
      produitId: produit.id,
      produit: produit.nom,
      quantite,
      prixUnit,
      total,
      statut,
      date: today,
    }
    setAchats((prev) => [achat, ...prev])

    if (statut === 'Livré') {
      setProduits((prev) => prev.map((p) => (p.id === produit.id ? { ...p, stock: p.stock + quantite } : p)))
    }

    setFournisseurs((prev) =>
      prev.map((f) => (f.id === fournisseur.id ? { ...f, totalAchats: f.totalAchats + total, derniereCommande: today } : f))
    )

    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <div>
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Achats</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Total dépensé : <span style={{ color: '#9ba8c4', fontWeight: 600 }}>{totalDepenses.toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
        <button
          onClick={ouvrirAjout}
          disabled={!peutAjouter}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: peutAjouter ? '#D4AF37' : '#4e5f82',
            color: '#0A1628',
            border: 'none',
            borderRadius: 8,
            padding: '0.65rem 1.1rem',
            fontWeight: 700,
            cursor: peutAjouter ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
          }}
        >
          <Plus size={16} /> Nouvel Achat
        </button>
      </div>

      {!peutAjouter && (
        <p style={{ color: '#f0a832', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Ajoutez d&apos;abord un{' '}
          {produits.length === 0 && <Link href="/produits" style={{ color: '#00BCD4' }}>produit</Link>}
          {produits.length === 0 && fournisseurs.length === 0 && ' et un '}
          {fournisseurs.length === 0 && <Link href="/fournisseurs" style={{ color: '#00BCD4' }}>fournisseur</Link>} pour enregistrer un achat.
        </p>
      )}

      {achats.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Aucun achat encore"
          message="Enregistrez votre premier achat fournisseur pour approvisionner votre stock."
          actionLabel={peutAjouter ? 'Nouvel achat' : undefined}
          onAction={peutAjouter ? ouvrirAjout : undefined}
        />
      ) : (
        <>
          <div className="sugu-kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Dépensé', value: `${totalDepenses.toLocaleString('fr-FR')} FCFA`, color: '#9ba8c4' },
              { label: 'Commandes Livrées', value: `${achats.filter((a) => a.statut === 'Livré').length}`, color: '#22d98a' },
              { label: 'En Attente', value: `${achats.filter((a) => a.statut === 'En attente').length}`, color: '#f0a832' },
            ].map((k) => (
              <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
                <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
                <p style={{ color: k.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="sugu-table-wrap" style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
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
                {achats.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05 }}
                    style={{ borderTop: '1px solid #16233d' }}
                  >
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvel achat">
        <form onSubmit={soumettre}>
          <FormField label="Fournisseur">
            <SelectInput required value={fournisseurId} onChange={(e) => setFournisseurId(Number(e.target.value))}>
              {fournisseurs.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Produit">
            <SelectInput required value={produitId} onChange={(e) => onProduitChange(Number(e.target.value))}>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </SelectInput>
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Quantité">
              <TextInput required type="number" min={1} value={quantite || ''} onChange={(e) => setQuantite(Number(e.target.value))} />
            </FormField>
            <FormField label="Prix unitaire (FCFA)">
              <TextInput required type="number" min={0} value={prixUnit || ''} onChange={(e) => setPrixUnit(Number(e.target.value))} />
            </FormField>
          </div>
          <FormField label="Statut">
            <SelectInput value={statut} onChange={(e) => setStatut(e.target.value as 'Livré' | 'En attente')}>
              <option value="Livré">Livré (stock mis à jour)</option>
              <option value="En attente">En attente</option>
            </SelectInput>
          </FormField>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem' }}>
            Total : <strong style={{ color: '#D4AF37' }}>{(quantite * prixUnit).toLocaleString('fr-FR')} FCFA</strong>
          </p>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel="Enregistrer l'achat" />
        </form>
      </Modal>
    </div>
  )
}
