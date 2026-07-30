'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, Trash2, Download } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, VenteLigne, Produit, Client, ModePaiement } from '@/lib/types'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'
import { FormField, TextInput, SelectInput, SubmitRow } from '@/components/FormField'

const MODES_PAIEMENT: ModePaiement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Crédit']

const MODE_STYLE: Record<ModePaiement, { bg: string; color: string }> = {
  'Espèces': { bg: 'rgba(34,217,138,0.1)', color: '#22d98a' },
  'Orange Money': { bg: 'rgba(240,168,50,0.12)', color: '#f0a832' },
  'Wave': { bg: 'rgba(0,188,212,0.12)', color: '#00BCD4' },
  'Moov Money': { bg: 'rgba(212,175,55,0.12)', color: '#D4AF37' },
  'Crédit': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
}

const today = () => new Date().toISOString().slice(0, 10)

export default function Ventes() {
  const [ventes, setVentes, loaded] = usePersistedBoutique<Vente[]>('ventes', [])
  const [produits, setProduits] = usePersistedBoutique<Produit[]>('produits', [])
  const [clients, setClients] = usePersistedBoutique<Client[]>('clients', [])
  const [showForm, setShowForm] = useState(false)

  const [clientId, setClientId] = useState<number | 'passage'>('passage')
  const [lignes, setLignes] = useState<VenteLigne[]>([])
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces')

  const totalJour = ventes.filter((v) => v.date === today()).reduce((acc, v) => acc + v.total, 0)
  const peutAjouter = produits.length > 0

  // ── Export CSV ventes du mois courant ──
  const exporterCSV = useCallback(() => {
    const maintenant = new Date()
    const moisCourant = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}`
    const ventesMois = ventes.filter((v) => v.date.startsWith(moisCourant))

    const lignes: string[] = [
      ['ID', 'Date', 'Client', 'Produits', 'Quantités', 'Total (FCFA)', 'Mode de paiement', 'Statut'].join(';'),
      ...ventesMois.map((v) => [
        `#${v.id.toString().slice(-4)}`,
        v.date,
        v.client,
        v.lignes.map((l) => l.nom).join(' | '),
        v.lignes.map((l) => l.quantite).join(' | '),
        v.total,
        v.modePaiement,
        v.statut,
      ].join(';')),
    ]

    const bom = '﻿' // BOM pour Excel (UTF-8)
    const blob = new Blob([bom + lignes.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ventes_${moisCourant}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [ventes])

  const ouvrirAjout = () => {
    setClientId('passage')
    setLignes(produits[0] ? [{ produitId: produits[0].id, nom: produits[0].nom, quantite: 1, prixUnit: produits[0].prixVente }] : [])
    setModePaiement('Espèces')
    setShowForm(true)
  }

  const ajouterLigne = () => {
    const p = produits.find((pr) => !lignes.some((l) => l.produitId === pr.id)) ?? produits[0]
    if (!p) return
    setLignes((prev) => [...prev, { produitId: p.id, nom: p.nom, quantite: 1, prixUnit: p.prixVente }])
  }

  const modifierLigne = (index: number, produitId: number) => {
    const p = produits.find((pr) => pr.id === produitId)
    if (!p) return
    setLignes((prev) => prev.map((l, i) => (i === index ? { produitId: p.id, nom: p.nom, quantite: l.quantite, prixUnit: p.prixVente } : l)))
  }

  const modifierQuantite = (index: number, quantite: number) => {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, quantite } : l)))
  }

  const supprimerLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  const total = lignes.reduce((a, l) => a + l.quantite * l.prixUnit, 0)

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault()
    if (lignes.length === 0 || total <= 0) return

    const client = clientId !== 'passage' ? clients.find((c) => c.id === clientId) : null
    const statut = modePaiement === 'Crédit' ? 'Crédit' : 'Payé'

    const vente: Vente = {
      id: Date.now(),
      clientId: client ? client.id : null,
      client: client ? client.nom : 'Client de passage',
      lignes,
      total,
      modePaiement,
      statut,
      date: today(),
    }
    setVentes((prev) => [vente, ...prev])

    setProduits((prev) =>
      prev.map((p) => {
        const ligne = lignes.find((l) => l.produitId === p.id)
        return ligne ? { ...p, stock: Math.max(0, p.stock - ligne.quantite) } : p
      })
    )

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
      <div className="sugu-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Ventes</h2>
          <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
            Aujourd&apos;hui : <span style={{ color: '#22d98a', fontWeight: 600 }}>{totalJour.toLocaleString('fr-FR')} FCFA</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {ventes.length > 0 && (
            <button
              onClick={exporterCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0,188,212,0.12)',
                color: '#00BCD4',
                border: '1px solid rgba(0,188,212,0.3)',
                borderRadius: 8,
                padding: '0.65rem 1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              <Download size={15} /> Exporter CSV
            </button>
          )}
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
            <Plus size={16} /> Nouvelle Vente
          </button>
        </div>
      </div>

      {!peutAjouter && (
        <p style={{ color: '#f0a832', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Ajoutez d&apos;abord un <Link href="/produits" style={{ color: '#00BCD4' }}>produit</Link> pour enregistrer une vente.
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
              { label: 'Total Ventes', value: ventes.reduce((a, v) => a + v.total, 0), color: '#D4AF37', suffix: 'FCFA' },
              { label: 'Ventes Payées', value: ventes.filter((v) => v.statut === 'Payé').length, color: '#22d98a', suffix: 'transactions' },
              { label: 'Ventes à Crédit', value: ventes.filter((v) => v.statut === 'Crédit').length, color: '#ef4444', suffix: 'transactions' },
            ].map((k) => (
              <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1rem', border: '1px solid #16233d' }}>
                <p style={{ color: '#4e5f82', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase' }}>{k.label}</p>
                <p style={{ color: k.color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                  {k.suffix === 'FCFA' ? k.value.toLocaleString('fr-FR') : k.value}{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{k.suffix}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="sugu-table-wrap" style={{ background: '#0c1528', borderRadius: 12, overflow: 'hidden', border: '1px solid #16233d' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: '#070e1f' }}>
                  {['#', 'Client', 'Montant', 'Produits', 'Paiement', 'Statut', 'Date'].map((h) => (
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
                {ventes.map((v, i) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.05 }}
                    style={{ borderTop: '1px solid #16233d' }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#4e5f82', fontSize: '0.8rem' }}>#{v.id.toString().slice(-4)}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f5f0e8', fontWeight: 500 }}>{v.client}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#D4AF37', fontWeight: 700 }}>
                      {v.total.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4' }}>
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
                          fontSize: '0.72rem',
                          fontWeight: 600,
                        }}
                      >
                        {v.modePaiement}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          background: v.statut === 'Payé' ? 'rgba(34,217,138,0.1)' : 'rgba(239,68,68,0.1)',
                          color: v.statut === 'Payé' ? '#22d98a' : '#ef4444',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 99,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {v.statut}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#9ba8c4', fontSize: '0.875rem' }}>{v.date}</td>
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
            <SelectInput value={clientId} onChange={(e) => setClientId(e.target.value === 'passage' ? 'passage' : Number(e.target.value))}>
              <option value="passage">Client de passage</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </SelectInput>
          </FormField>

          <label style={{ display: 'block', color: '#9ba8c4', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>Produits</label>
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
                style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '0.5rem', cursor: 'pointer', color: '#ef4444' }}
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
              border: '1px dashed #16233d',
              color: '#00BCD4',
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
            <SelectInput value={modePaiement} onChange={(e) => setModePaiement(e.target.value as ModePaiement)}>
              {MODES_PAIEMENT.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </SelectInput>
          </FormField>

          <p style={{ color: '#4e5f82', fontSize: '0.8rem' }}>
            Total : <strong style={{ color: '#D4AF37' }}>{total.toLocaleString('fr-FR')} FCFA</strong>
          </p>
          <SubmitRow onCancel={() => setShowForm(false)} submitLabel="Enregistrer la vente" />
        </form>
      </Modal>
    </div>
  )
}
