'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'
import type { Client, Vente } from '@/lib/types'
import type { Paiement } from '@/lib/sync/types'
import { MODES_REMBOURSEMENT, type ModeRemboursement } from '@/lib/credit'
import { remboursementSchema } from '@/lib/sync/schemas'

type Props = {
  client: Client
  ventes: Vente[]
  paiements: Paiement[]
  onRembourser: (clientId: number, montant: number, mode: ModeRemboursement) => string | null
}

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`

export default function CreditClient({ client, ventes, paiements, onRembourser }: Props) {
  const [montant, setMontant] = useState('')
  const [mode, setMode] = useState<ModeRemboursement>('Espèces')
  const [erreur, setErreur] = useState<string | null>(null)

  const mouvements = [
    ...ventes.filter((v) => v.clientId === client.id && v.statut === 'Crédit').map((v) => ({ id: v.id, date: v.date, libelle: 'Achat à crédit', montant: v.total, signe: 1 as const })),
    ...paiements.filter((p) => p.clientId === client.id).map((p) => ({ id: p.id, date: p.date, libelle: `Remboursement (${p.mode})`, montant: p.montant, signe: -1 as const })),
  ].sort((a, b) => b.id - a.id)

  const valider = (e: React.FormEvent) => {
    e.preventDefault()
    const parse = remboursementSchema.safeParse({ clientId: client.id, montant: Number(montant), mode })
    if (!parse.success) {
      setErreur(parse.error.issues[0]?.message ?? 'Montant non valide')
      return
    }
    const echec = onRembourser(client.id, parse.data.montant, parse.data.mode)
    if (echec) {
      setErreur(echec)
      return
    }
    setErreur(null)
    setMontant('')
    toast.success(`${fcfa(parse.data.montant)} encaissés`)
  }

  return (
    <section aria-label="Crédit du client" style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          background: client.soldeDu > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,217,138,0.08)',
          border: `1px solid ${client.soldeDu > 0 ? '#ef444455' : '#22d98a55'}`,
          borderRadius: 12,
          padding: '1rem',
          marginBottom: '0.9rem',
        }}
      >
        <p style={{ color: '#9ba8c4', fontSize: '0.78rem', margin: '0 0 0.25rem', textTransform: 'uppercase' }}>Solde dû</p>
        <p data-testid="solde-du" style={{ color: client.soldeDu > 0 ? '#ef4444' : '#22d98a', fontWeight: 900, fontSize: '1.6rem', margin: 0 }}>
          {client.soldeDu > 0 ? fcfa(client.soldeDu) : 'Soldé'}
        </p>
      </div>

      {client.soldeDu > 0 && (
        <form onSubmit={valider} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          <label htmlFor="remb-montant" style={{ color: '#9ba8c4', fontSize: '0.88rem', fontWeight: 700 }}>
            Montant encaissé
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="remb-montant"
              type="number"
              min={1}
              inputMode="numeric"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="0"
              style={{ flex: 1, minHeight: 56, background: '#070e1f', border: '1px solid #16233d', borderRadius: 12, padding: '0.6rem 0.9rem', color: '#f5f0e8', fontSize: '1.2rem', fontWeight: 700 }}
            />
            <button
              type="button"
              onClick={() => setMontant(String(client.soldeDu))}
              style={{ minHeight: 56, padding: '0 0.9rem', borderRadius: 12, border: '1px solid #00BCD4', background: 'transparent', color: '#00BCD4', fontWeight: 800, cursor: 'pointer' }}
            >
              Tout
            </button>
          </div>
          <label htmlFor="remb-mode" style={{ color: '#9ba8c4', fontSize: '0.88rem', fontWeight: 700 }}>
            Payé par
          </label>
          <select
            id="remb-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeRemboursement)}
            style={{ minHeight: 52, background: '#070e1f', border: '1px solid #16233d', borderRadius: 12, padding: '0.6rem 0.9rem', color: '#f5f0e8', fontSize: '1rem' }}
          >
            {MODES_REMBOURSEMENT.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {erreur && (
            <p role="alert" style={{ color: '#ef4444', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              {erreur}
            </p>
          )}
          <button
            type="submit"
            style={{ minHeight: 58, borderRadius: 14, border: 'none', background: '#22d98a', color: '#0A1628', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Wallet size={20} /> Encaisser le remboursement
          </button>
        </form>
      )}

      <p style={{ color: '#9ba8c4', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Crédits et remboursements</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 220, overflowY: 'auto' }}>
        {mouvements.length === 0 && <p style={{ color: '#9ba8c4', fontSize: '0.85rem', margin: 0 }}>Aucun crédit pour ce client.</p>}
        {mouvements.map((m) => (
          <div key={`${m.signe}-${m.id}`} style={{ display: 'flex', justifyContent: 'space-between', background: '#070e1f', borderRadius: 8, padding: '0.55rem 0.75rem' }}>
            <div>
              <p style={{ color: '#f5f0e8', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{m.libelle}</p>
              <p style={{ color: '#9ba8c4', fontSize: '0.75rem', margin: '0.1rem 0 0' }}>{m.date}</p>
            </div>
            <p style={{ color: m.signe === 1 ? '#ef4444' : '#22d98a', fontWeight: 800, margin: 0 }}>
              {m.signe === 1 ? '+' : '−'} {fcfa(m.montant)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
