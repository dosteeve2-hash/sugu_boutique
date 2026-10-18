import { describe, expect, it } from 'vitest'
import {
  analyserCle,
  diffCollection,
  ecrireOutbox,
  fusionnerOps,
  lireOutbox,
  opsDeToutesLesDonnees,
  opsDepuisEcriture,
  resumeDonneesLocales,
} from '@/lib/sync/outbox'
import type { Op } from '@/lib/sync/types'

class FauxStockage {
  private donnees = new Map<string, string>()
  get length() {
    return this.donnees.size
  }
  key(i: number) {
    return [...this.donnees.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.donnees.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.donnees.set(k, v)
  }
  removeItem(k: string) {
    this.donnees.delete(k)
  }
}

const maintenant = new Date('2026-10-18T10:00:00.000Z')
let n = 0
const genId = () => `op-${++n}-xxxxxxxx`

const produit = (id: number, stock: number) => ({
  id,
  nom: `P${id}`,
  categorie: '',
  prixAchat: 100,
  prixVente: 150,
  stock,
  stockMin: 1,
})

describe('analyserCle', () => {
  it('reconnaît les clés synchronisées', () => {
    expect(analyserCle('sugu_boutiques')).toEqual({ entite: 'boutiques' })
    expect(analyserCle('sugu_bt_1760000000000_ab12cd_produits')).toEqual({ entite: 'produits', boutiqueId: 'bt_1760000000000_ab12cd' })
    expect(analyserCle('sugu_bt_1_x_paiements')).toEqual({ entite: 'paiements', boutiqueId: 'bt_1_x' })
  })
  it('ignore les autres clés', () => {
    expect(analyserCle('sugu_langue')).toBeNull()
    expect(analyserCle('sugu_boutique_active')).toBeNull()
    expect(analyserCle('sugu_bt_1_x_commandes')).toBeNull()
    expect(analyserCle('sugucloud_outbox')).toBeNull()
  })
})

describe('diffCollection', () => {
  it('détecte ajouts, modifications et suppressions', () => {
    const avant = [produit(1, 5), produit(2, 5)]
    const apres = [produit(1, 4), produit(3, 9)]
    const d = diffCollection(avant, apres)
    expect(d.upserts.map((p) => p.id)).toEqual([1, 3])
    expect(d.suppressions).toEqual([2])
  })
  it('ne produit rien si rien ne change', () => {
    const d = diffCollection([produit(1, 5)], [produit(1, 5)])
    expect(d.upserts).toHaveLength(0)
    expect(d.suppressions).toHaveLength(0)
  })
})

describe('opsDepuisEcriture', () => {
  it('crée une opération par changement avec la boutique et l’horodatage', () => {
    const ops = opsDepuisEcriture('sugu_bt_1_x_produits', [], [produit(7, 3)], maintenant, genId)
    expect(ops).toHaveLength(1)
    expect(ops[0]).toMatchObject({ entite: 'produits', boutiqueId: 'bt_1_x', id: '7', type: 'upsert', at: maintenant.toISOString() })
  })
  it('crée des suppressions', () => {
    const ops = opsDepuisEcriture('sugu_bt_1_x_clients', [{ id: 4 }], [], maintenant, genId)
    expect(ops).toEqual([expect.objectContaining({ entite: 'clients', type: 'delete', id: '4', boutiqueId: 'bt_1_x' })])
  })
  it('utilise l’id de la boutique pour la clé des boutiques', () => {
    const b = { id: 'bt_9_z', nom: 'A', type: 'Autre', emoji: '', couleur: '', dateCreation: '2026-10-18' }
    const ops = opsDepuisEcriture('sugu_boutiques', [], [b], maintenant, genId)
    expect(ops[0]).toMatchObject({ entite: 'boutiques', boutiqueId: 'bt_9_z', id: 'bt_9_z' })
  })
  it('ignore les clés non synchronisées', () => {
    expect(opsDepuisEcriture('sugu_langue', [], [1], maintenant, genId)).toEqual([])
  })
})

describe('fusionnerOps (file d’attente)', () => {
  const op = (opId: string, id: string, stock: number): Op => ({
    opId,
    entite: 'produits',
    boutiqueId: 'bt_1_x',
    id,
    type: 'upsert',
    data: produit(Number(id), stock),
    at: maintenant.toISOString(),
  })
  it('garde seulement la dernière écriture d’une même entité', () => {
    const fusion = fusionnerOps([op('a-12345678', '1', 5), op('b-12345678', '2', 5)], [op('c-12345678', '1', 2)])
    expect(fusion).toHaveLength(2)
    expect(fusion.find((o) => o.id === '1')?.opId).toBe('c-12345678')
  })
  it('persiste et relit la file', () => {
    const s = new FauxStockage()
    ecrireOutbox(s, [op('a-12345678', '1', 5)])
    expect(lireOutbox(s)).toHaveLength(1)
    ecrireOutbox(s, [])
    expect(s.getItem('sugucloud_outbox')).toBeNull()
  })
  it('résiste à une file corrompue', () => {
    const s = new FauxStockage()
    s.setItem('sugucloud_outbox', '{pas du json')
    expect(lireOutbox(s)).toEqual([])
  })
})

describe('première sauvegarde', () => {
  it('transforme toutes les données locales en opérations', () => {
    const s = new FauxStockage()
    s.setItem('sugu_boutiques', JSON.stringify([{ id: 'bt_1_x', nom: 'Ma boutique', type: 'Autre', emoji: '🏪', couleur: '#D4AF37', dateCreation: '2026-10-18' }]))
    s.setItem('sugu_bt_1_x_produits', JSON.stringify([produit(1, 5), produit(2, 3)]))
    s.setItem('sugu_bt_1_x_clients', JSON.stringify([{ id: 3, nom: 'A', telephone: '', ville: '', soldeDu: 0, totalAchats: 0, derniereVisite: '' }]))
    const ops = opsDeToutesLesDonnees(s, maintenant, genId)
    expect(ops.map((o) => o.entite)).toEqual(['boutiques', 'produits', 'produits', 'clients'])
    expect(resumeDonneesLocales(s)).toEqual({ boutiques: 1, produits: 2, clients: 1, ventes: 0 })
  })
})
