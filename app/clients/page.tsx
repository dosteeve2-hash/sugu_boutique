'use client'

import { useMemo, useState } from 'react'
import { m as motion } from 'framer-motion'
import { Plus, Phone, AlertCircle, CheckCircle, Edit2, Trash2, Users, Smile, Meh, Frown } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Client, Vente } from '@/lib/types'
import type { Paiement } from '@/lib/sync/types'
import CreditClient from '@/components/CreditClient'
import { enregistrerRemboursement, type ModeRemboursement } from '@/lib/credit'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'
import { useLangue } from '@/components/LangueProvider'

const vide: Omit<Client, 'id'> = {
  nom: '',
  telephone: '',
  ville: '',
  soldeDu: 0,
  totalAchats: 0,
  derniereVisite: new Date().toISOString().slice(0, 10),
}

export default function Clients() {
  const { t } = useLangue()
  const [clients, setClients, loaded] = usePersistedBoutique<Client[]>('clients', [])
  const [ventes] = usePersistedBoutique<Vente[]>('ventes', [])
  const [paiements, setPaiements] = usePersistedBoutique<Paiement[]>('paiements', [])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Client | null>(null)
  const [form, setForm] = useState(vide)
  const [profilBrut, setProfil] = useState<Client | null>(null)
  const profil = profilBrut ? clients.find((c) => c.id === profilBrut.id) ?? profilBrut : null

  const totalSoldeDu = clients.reduce((a, c) => a + c.soldeDu, 0)

  const clientsFiltres = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return clients
    return clients.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.telephone.toLowerCase().includes(q)
    )
  }, [clients, search])

  const ouvrirAjout = () => {
    setEdition(null)
    setForm(vide)
    setShowForm(true)
  }

  const ouvrirEdition = (c: Client) => {
    setEdition(c)
    setForm({ nom: c.nom, telephone: c.telephone, ville: c.ville, soldeDu: c.soldeDu, totalAchats: c.totalAchats, derniereVisite: c.derniereVisite })
    setShowForm(true)
  }

  const supprimer = (id: number) => {
    if (confirm('Supprimer ce client ?')) {
      setClients((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    if (edition) {
      setClients((prev) => prev.map((c) => (c.id === edition.id ? { ...edition, ...form } : c)))
    } else {
      setClients((prev) => [...prev, { ...form, id: Date.now() }])
    }
    setShowForm(false)
  }

  const rembourser = (clientId: number, montant: number, mode: ModeRemboursement): string | null => {
    const r = enregistrerRemboursement(clients, { clientId, montant, mode })
    if (!r.ok) return r.erreur
    setClients(r.clients)
    setPaiements((prev) => [r.paiement, ...prev])
    return null
  }

  if (!loaded) return null

  return (
    <div>
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Clients</h2>
          <p style={{ color: '#7b89a8', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''}
            {totalSoldeDu > 0 && (
              <>
                {' '}• <span style={{ color: '#ef4444' }}>{totalSoldeDu.toLocaleString('fr-FR')} FCFA à recouvrer</span>
              </>
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
          <Plus size={16} /> Ajouter un Client
        </button>
      </div>

      {/* Barre de recherche */}
      {clients.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <svg
            style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#7b89a8' }}
            width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou téléphone…"
            style={{
              width: '100%',
              minHeight: 48,
              background: '#0c1528',
              border: '1px solid #16233d',
              borderRadius: 12,
              padding: '0.65rem 0.75rem 0.65rem 2.75rem',
              color: '#f5f0e8',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client encore"
          message="Ajoutez votre premier client pour suivre ses achats et son solde."
          actionLabel="Ajouter un client"
          onAction={ouvrirAjout}
        />
      ) : (
        <>
          <div className="sugu-kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Clients', value: clients.length, color: '#00BCD4' },
              { label: 'Clients Soldés', value: clients.filter((c) => c.soldeDu === 0).length, color: '#22d98a' },
              { label: 'Clients avec Crédit', value: clients.filter((c) => c.soldeDu > 0).length, color: '#ef4444' },
            ].map((k) => (
              <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
                <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
                <p style={{ color: k.color, fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="sugu-table-wrap" style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#070e1f' }}>
                  {['Client', 'Téléphone', 'Ville', 'Total Achats', 'Solde Dû', 'Dernière Visite', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        color: '#7b89a8',
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
                {clientsFiltres.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05 }}
                    onClick={() => setProfil(c)}
                    style={{ borderTop: '1px solid #16233d', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 600 }}>{c.nom}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ba8c4', fontSize: '0.875rem' }}>
                        <Phone size={13} /> {c.telephone || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{c.ville || '—'}</td>
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
                    <td style={{ padding: '0.75rem 1rem' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.soldeDu > 0 && (
                          <button
                            onClick={() => setProfil(c)}
                            aria-label={`Encaisser un remboursement de ${c.nom}`}
                            style={{ background: 'rgba(34,217,138,0.12)', border: 'none', borderRadius: 8, padding: '0.35rem 0.7rem', minHeight: 48, cursor: 'pointer', color: '#22d98a', fontWeight: 800, fontSize: '0.8rem' }}
                          >
                            Encaisser
                          </button>
                        )}
                        <button
                          onClick={() => ouvrirEdition(c)}
                          aria-label={`Modifier ${c.nom}`}
                          style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 8, padding: '0.35rem', minWidth: 48, cursor: 'pointer', color: '#00BCD4' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => supprimer(c.id)}
                          aria-label={`Supprimer ${c.nom}`}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, padding: '0.35rem', minWidth: 48, cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edition ? 'Modifier le client' : 'Ajouter un client'}>
        <form onSubmit={soumettre}>
          <FormField label="Nom">
            <TextInput required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Aminata Diallo" />
          </FormField>
          <FormField label="Téléphone">
            <TextInput value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="Ex: +226 70 11 22 33" />
          </FormField>
          <FormField label="Ville">
            <TextInput value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} placeholder="Ex: Ouagadougou" />
          </FormField>
          <FormField label="Solde dû (FCFA)">
            <TextInput type="number" min={0} value={form.soldeDu || ''} onChange={(e) => setForm({ ...form, soldeDu: Number(e.target.value) })} />
          </FormField>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel={edition ? 'Enregistrer' : 'Ajouter'} />
        </form>
      </Modal>

      <Modal open={!!profil} onClose={() => setProfil(null)} title={profil?.nom ?? ''}>
        {profil && (() => {
          const historique = ventes.filter((v) => v.clientId === profil.id).sort((a, b) => b.id - a.id)
          const avecSatisfaction = historique.filter((v) => v.satisfaction)
          const pctBien = avecSatisfaction.length > 0
            ? Math.round((avecSatisfaction.filter((v) => v.satisfaction === 'bien').length / avecSatisfaction.length) * 100)
            : null
          const iconeSatisf = { bien: <Smile size={15} color="#22d98a" />, correct: <Meh size={15} color="#f0a832" />, probleme: <Frown size={15} color="#ef4444" /> }
          return (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, background: '#070e1f', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Total Achats</p>
                  <p style={{ color: '#D4AF37', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>{profil.totalAchats.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div style={{ flex: 1, background: '#070e1f', borderRadius: 10, padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>{t.satisfaction}</p>
                  <p style={{ color: pctBien !== null ? '#22d98a' : '#7b89a8', fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>
                    {pctBien !== null ? `${pctBien}%` : '—'}
                  </p>
                </div>
              </div>
              <CreditClient client={profil} ventes={ventes} paiements={paiements} onRembourser={rembourser} />
              <p style={{ color: '#9ba8c4', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Historique des ventes</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto' }}>
                {historique.length === 0 && <p style={{ color: '#7b89a8', fontSize: '0.82rem' }}>Aucune vente encore.</p>}
                {historique.map((v) => (
                  <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#070e1f', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
                    <div>
                      <p style={{ color: '#f5f0e8', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{v.total.toLocaleString('fr-FR')} FCFA</p>
                      <p style={{ color: '#7b89a8', fontSize: '0.75rem', margin: '0.1rem 0 0' }}>{v.date}</p>
                    </div>
                    {v.satisfaction && iconeSatisf[v.satisfaction]}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
