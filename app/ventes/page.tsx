'use client'

import { useState } from 'react'
import Link from 'next/link'
import { m as motion } from 'framer-motion'
import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, VenteLigne, Produit, Client, ModePaiement } from '@/lib/types'
import { toast } from 'sonner'
import { appliquerVenteAuStock, creditAutorise, detecterDepassementStock } from '@/lib/calculs'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SelectInput, SubmitRow } from '@/components/FormField'

const MODES_PAIEMENT: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Crédit']

const MODE_STYLE: Record<ModePaiement, { bg: string; color: string }> = {
  'Espèces': { bg: 'rgba(145,217,163,0.1)', color: '#91D9A3' },
  'Orange Money': { bg: 'rgba(227,160,15,0.12)', color: '#E3A00F' },
  'Wave': { bg: 'rgba(227,160,15,0.12)', color: '#E3A00F' },
  'Moov Money': { bg: 'rgba(227,160,15,0.12)', color: '#E3A00F' },
  'Crédit': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
}

const today = () => new Date().toISOString().slice(0, 10)

const ligneDepuisProduit = (p: Produit): VenteLigne => ({
  produitId: p.id,
  nom: p.nom,
  quantite: 1,
  prixUnit: p.prixVente,
  prixAchat: p.prixAchat > 0 ? p.prixAchat : undefined,
})

export default function Ventes() {
  const [ventes, setVentes, loaded] = usePersistedBoutique<Vente[]>('ventes', [])
  const [produits, setProduits] = usePersistedBoutique<Produit[]>('produits', [])
  const [clients, setClients] = usePersistedBoutique<Client[]>('clients', [])
  const [showForm, setShowForm] = useState(false)

  const [clientId, setClientId] = useState<number | 'passage'>('passage')
  const [lignes, setLignes] = useState<VenteLigne[]>([])
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')
  const [erreur, setErreur] = useState<string | null>(null)

  const totalJour = ventes.filter((v) => v.date === today()).reduce((acc, v) => acc + v.total, 0)
  const peutAjouter = produits.length > 0

  const ouvrirAjout = () => {
    setClientId('passage')
    setLignes(produits[0] ? [ligneDepuisProduit(produits[0])] : [])
    setModePaiement('Espèces')
    setErreur(null)
    setShowForm(true)
  }

  const ajouterLigne = () => {
    const p = produits.find((pr) => !lignes.some((l) => l.produitId === pr.id)) ?? produits[0]
    if (!p) return
    setLignes((prev) => [...prev, ligneDepuisProduit(p)])
  }

  const modifierLigne = (index: number, produitId: number) => {
    const p = produits.find((pr) => pr.id === produitId)
    if (!p) return
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...ligneDepuisProduit(p), quantite: l.quantite } : l)))
  }

  const modifierQuantite = (index: number, quantite: number) => {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, quantite } : l)))
  }

  const supprimerLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  const total = lignes.reduce((a, l) => a + l.quantite * l.prixUnit, 0)
  const depassementsForm = detecterDepassementStock(lignes, produits)

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    const lignesValides = lignes.filter((l) => l.quantite > 0)
    if (lignesValides.length === 0 || total <= 0) return

    const client = clientId !== 'passage' ? clients.find((c) => c.id === clientId) : null
    if (!creditAutorise(modePaiement, client ? client.id : null)) {
      const message = 'Pour une vente à crédit, choisissez un client. Sinon personne ne doit cet argent.'
      setErreur(message)
      toast.error(message)
      return
    }
    const depassements = detecterDepassementStock(lignesValides, produits)
    if (depassements.length > 0) {
      const detail = depassements.map((d) => `${d.nom} (${d.demande} demandé, ${d.disponible} en stock)`).join(', ')
      if (!window.confirm(`Stock insuffisant : ${detail}. Enregistrer quand même ?`)) return
    }
    const statut = modePaiement === 'Crédit' ? 'Crédit' : 'Payé'

    const vente: Vente = {
      id: Date.now(),
      clientId: client ? client.id : null,
      client: client ? client.nom : 'Client de passage',
      lignes: lignesValides,
      total,
      modePaiement,
      statut,
      date: today(),
    }
    setVentes((prev) => [vente, ...prev])

    setProduits((prev) => appliquerVenteAuStock(prev, lignesValides))

    if (client) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id
            ? { ...c, totalAchats: c.totalAchats + total, derniereVisite: today(), soldeDu: c.soldeDu + (statut === 'Crédit' ? total : 0) }
            : c
        )
      )
    }

    setShowForm(false)
  }

  if (!loaded) return null

  return (
    <div>
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Ventes</h2>
          <p style={{ color: '#B7C5AE', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Aujourd&apos;hui : <span style={{ color: '#91D9A3', fontWeight: 600 }}>{totalJour.toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
        <button
          onClick={ouvrirAjout}
          disabled={!peutAjouter}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: peutAjouter ? '#E3A00F' : '#B7C5AE',
            color: '#1F3A2B',
            border: 'none',
            borderRadius: 8,
            padding: '0.65rem 1.1rem',
            fontWeight: 700,
            cursor: peutAjouter ? 'pointer' : 'not-allowed',
            fontSize: '0.875rem',
          }}
        >
          <Plus size={16} /> Nouvelle Vente
        </button>
      </div>

      {!peutAjouter && (
        <p style={{ color: '#E3A00F', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Ajoutez d&apos;abord un <Link href="/produits" style={{ color: '#E3A00F' }}>produit</Link> pour enregistrer une vente.
        </p>
      )}

      {ventes.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune vente encore"
          message="Enregistrez votre première vente pour suivre votre chiffre d'affaires."
          actionLabel={peutAjouter ? 'Nouvelle vente' : undefined}
          onAction={peutAjouter ? ouvrirAjout : undefined}
        />
      ) : (
        <>
          <div className="sugu-kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Ventes', value: ventes.reduce((a, v) => a + v.total, 0), color: '#E3A00F', suffix: 'FCFA' },
              { label: 'Ventes Payées', value: ventes.filter((v) => v.statut === 'Payé').length, color: '#91D9A3', suffix: 'transactions' },
              { label: 'Ventes à Crédit', value: ventes.filter((v) => v.statut === 'Crédit').length, color: '#ef4444', suffix: 'transactions' },
            ].map((k) => (
              <div key={k.label} style={{ background: '#263F30', borderRadius: 12, padding: '1rem', border: '1px solid #496653' }}>
                <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
                <p style={{ color: k.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                  {k.suffix === 'FCFA' ? k.value.toLocaleString('fr-FR') : k.value}{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{k.suffix}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="sugu-table-wrap" style={{ background: '#263F30', borderRadius: 12, overflow: 'hidden', border: '1px solid #496653' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#1F3A2B' }}>
                  {['#', 'Client', 'Montant', 'Produits', 'Paiement', 'Statut', 'Date'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        color: '#B7C5AE',
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
                {ventes.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05 }}
                    style={{ borderTop: '1px solid #496653' }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#B7C5AE', fontSize: '0.8rem' }}>#{v.id.toString().slice(-4)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#F2EBCF', fontWeight: 500 }}>{v.client}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#E3A00F', fontWeight: 700 }}>
                      {v.total.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#D9DEC9' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ShoppingCart size={14} /> {v.lignes.reduce((a, l) => a + l.quantite, 0)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          background: MODE_STYLE[v.modePaiement].bg,
                          color: MODE_STYLE[v.modePaiement].color,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 99,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {v.modePaiement}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          background: v.statut === 'Payé' ? 'rgba(145,217,163,0.1)' : 'rgba(239,68,68,0.1)',
                          color: v.statut === 'Payé' ? '#91D9A3' : '#ef4444',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 99,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {v.statut}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#D9DEC9', fontSize: '0.875rem' }}>{v.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvelle vente">
        <form onSubmit={soumettre}>
          <FormField label="Client">
            <SelectInput value={clientId} onChange={(e) => { setClientId(e.target.value === 'passage' ? 'passage' : Number(e.target.value)); setErreur(null) }}>
              <option value="passage">Client de passage</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </SelectInput>
          </FormField>

          <label style={{ display: 'block', color: '#D9DEC9', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>Produits</label>
          {lignes.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <SelectInput value={l.produitId} onChange={(e) => modifierLigne(i, Number(e.target.value))} style={{ flex: 2 }}>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </SelectInput>
              <TextInput
                type="number"
                min={1}
                value={l.quantite || ''}
                onChange={(e) => modifierQuantite(i, Number(e.target.value))}
                style={{ flex: 1, minWidth: 60 }}
              />
              <button
                type="button"
                onClick={() => supprimerLigne(i)}
                aria-label={`Retirer ${l.nom} de la vente`}
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '0.5rem', minWidth: 48, cursor: 'pointer', color: '#ef4444' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={ajouterLigne}
            disabled={lignes.length >= produits.length}
            style={{
              background: 'transparent',
              border: '1px dashed #496653',
              color: '#E3A00F',
              borderRadius: 8,
              padding: '0.5rem',
              width: '100%',
              cursor: lignes.length >= produits.length ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              marginBottom: '1rem',
            }}
          >
            + Ajouter un produit
          </button>

          <FormField label="Mode de paiement">
            <SelectInput value={modePaiement} onChange={(e) => { setModePaiement(e.target.value as ModePaiement); setErreur(null) }}>
              {MODES_PAIEMENT.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </SelectInput>
          </FormField>

          {depassementsForm.length > 0 && (
            <p role="alert" style={{ color: '#E3A00F', fontSize: '0.85rem', fontWeight: 600 }}>
              Stock insuffisant : {depassementsForm.map((d) => `${d.nom} (${d.disponible} en stock)`).join(', ')}
            </p>
          )}
          {modePaiement === 'Crédit' && clientId === 'passage' && (
            <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
              Choisissez un client pour une vente à crédit.{' '}
              <Link href="/clients" style={{ color: '#E3A00F' }}>Créer un client</Link>
            </p>
          )}
          {erreur && modePaiement !== 'Crédit' && (
            <p role="alert" style={{ color: '#ef4444', fontSize: '0.85rem' }}>{erreur}</p>
          )}
          <p style={{ color: '#D9DEC9', fontSize: '0.9rem' }}>
            Total : <strong style={{ color: '#E3A00F' }}>{total.toLocaleString('fr-FR')} FCFA</strong>
          </p>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel="Enregistrer la vente" />
        </form>
      </Modal>
    </div>
  )
}
