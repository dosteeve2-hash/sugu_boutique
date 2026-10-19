import { describe, expect, it } from 'vitest'
import { appliquerVenteAuClient, enregistrerRemboursement, soldeDepuisHistorique } from '@/lib/credit'
import { creditAutorise } from '@/lib/calculs'
import type { Client, Vente } from '@/lib/types'
import type { Paiement } from '@/lib/sync/types'

const client = (id: number, soldeDu = 0): Client => ({ id, nom: `C${id}`, telephone: '', ville: '', soldeDu, totalAchats: 0, derniereVisite: '' })
const vente = (id: number, clientId: number | null, total: number, statut: Vente['statut']): Vente => ({
  id,
  clientId,
  client: 'x',
  lignes: [],
  total,
  modePaiement: statut === 'Crédit' ? 'Crédit' : 'Espèces',
  statut,
  date: '2026-10-18',
})

describe('crédit à la caisse', () => {
  it('exige un client pour un crédit', () => {
    expect(creditAutorise('Crédit', null)).toBe(false)
    expect(creditAutorise('Crédit', 3)).toBe(true)
    expect(creditAutorise('Espèces', null)).toBe(true)
  })

  it('une vente à crédit augmente le solde dû du client', () => {
    const apres = appliquerVenteAuClient([client(1, 500), client(2)], 1, { total: 2400, statut: 'Crédit', date: '2026-10-18' })
    expect(apres[0].soldeDu).toBe(2900)
    expect(apres[0].totalAchats).toBe(2400)
    expect(apres[1].soldeDu).toBe(0)
  })

  it('une vente payée n’augmente pas la dette', () => {
    const apres = appliquerVenteAuClient([client(1, 500)], 1, { total: 1000, statut: 'Payé', date: '2026-10-18' })
    expect(apres[0].soldeDu).toBe(500)
    expect(apres[0].totalAchats).toBe(1000)
  })
})

describe('remboursements', () => {
  const maintenant = new Date('2026-10-18T10:00:00.000Z')

  it('remboursement partiel puis total', () => {
    const r1 = enregistrerRemboursement([client(1, 3000)], { clientId: 1, montant: 1000, mode: 'Espèces' }, maintenant)
    expect(r1.ok).toBe(true)
    if (!r1.ok) return
    expect(r1.clients[0].soldeDu).toBe(2000)
    expect(r1.paiement).toMatchObject({ clientId: 1, montant: 1000, mode: 'Espèces', date: '2026-10-18' })
    const r2 = enregistrerRemboursement(r1.clients, { clientId: 1, montant: 2000, mode: 'Wave' }, maintenant)
    expect(r2.ok && r2.clients[0].soldeDu).toBe(0)
  })

  it('refuse un montant supérieur à la dette', () => {
    const r = enregistrerRemboursement([client(1, 500)], { clientId: 1, montant: 501, mode: 'Espèces' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erreur).toContain('500')
  })

  it('refuse zéro, négatif, décimal et client inconnu', () => {
    const cs = [client(1, 500)]
    expect(enregistrerRemboursement(cs, { clientId: 1, montant: 0, mode: 'Espèces' }).ok).toBe(false)
    expect(enregistrerRemboursement(cs, { clientId: 1, montant: -5, mode: 'Espèces' }).ok).toBe(false)
    expect(enregistrerRemboursement(cs, { clientId: 1, montant: 10.5, mode: 'Espèces' }).ok).toBe(false)
    expect(enregistrerRemboursement(cs, { clientId: 9, montant: 10, mode: 'Espèces' }).ok).toBe(false)
  })

  it('ne modifie pas la liste d’origine', () => {
    const cs = [client(1, 500)]
    enregistrerRemboursement(cs, { clientId: 1, montant: 100, mode: 'Espèces' })
    expect(cs[0].soldeDu).toBe(500)
  })

  it('le solde recalculé depuis l’historique correspond au solde tenu à jour', () => {
    const ventes = [vente(1, 1, 2000, 'Crédit'), vente(2, 1, 700, 'Payé'), vente(3, 1, 1000, 'Crédit'), vente(4, 2, 5000, 'Crédit')]
    const paiements: Paiement[] = [{ id: 10, clientId: 1, montant: 1200, mode: 'Espèces', date: '2026-10-18' }]
    expect(soldeDepuisHistorique(ventes, paiements, 1)).toBe(1800)
    expect(soldeDepuisHistorique(ventes, paiements, 2)).toBe(5000)
  })
})
