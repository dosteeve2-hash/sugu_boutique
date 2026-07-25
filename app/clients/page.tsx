'use client'

import { useState } from 'react'
import { Plus, Phone, AlertCircle, CheckCircle, Edit2, Trash2, Users } from 'lucide-react'
import { usePersisted } from '@/lib/storage'
import { Client } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SubmitRow } from '@/components/FormField'

const vide: Omit<Client, 'id'> = {
  nom: '',
  telephone: '',
  ville: '',
  soldeDu: 0,
  totalAchats: 0,
  derniereVisite: new Date().toISOString().slice(0, 10),
}

export default function Clients() {
  const [clients, setClients, loaded] = usePersisted<Client[]>('sugu_clients', [])
  const [showForm, setShowForm] = useState(false)
  const [edition, setEdition] = useState<Client | null>(null)
  const [form, setForm] = useState(vide)

  const totalSoldeDu = clients.reduce((a, c) => a + c.soldeDu, 0)

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

  if (!loaded) return null

  return (
    <div>
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Clients</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
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
                <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
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
                {clients.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid #16233d' }}>
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
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => ouvrirEdition(c)}
                          style={{ background: 'rgba(0,188,212,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: '#00BCD4' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => supprimer(c.id)}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
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
    </div>
  )
}
