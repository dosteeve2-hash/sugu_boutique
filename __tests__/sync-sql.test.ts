import { describe, expect, it } from 'vitest'
import {
  appliquerLot,
  appliquerOp,
  construireSuppression,
  construireUpsert,
  construireUpsertBoutique,
  type ClientTransaction,
  type Executeur,
} from '@/lib/server/sync-sql'
import { traiterPull, traiterPush } from '@/lib/server/sync-route'
import type { Pool } from 'pg'
import type { Op } from '@/lib/sync/types'

const AT = '2026-10-18T10:00:00.000Z'
const produit = { id: 1, nom: 'Sucre', categorie: '', prixAchat: 600, prixVente: 800, stock: 2, stockMin: 1 }

type Appel = { text: string; values: unknown[] }

function faux(reponses: (appel: Appel) => { rows: Record<string, unknown>[]; rowCount: number } | void) {
  const appels: Appel[] = []
  const db: Executeur & { release: () => void } = {
    query: async (text, values = []) => {
      const appel = { text, values }
      appels.push(appel)
      return reponses(appel) ?? { rows: [], rowCount: 1 }
    },
    release: () => undefined,
  }
  return { db, appels }
}

const op = (partiel: Partial<Op> & Pick<Op, 'opId' | 'entite' | 'id'>): Op => ({
  boutiqueId: 'bt_1_x',
  type: 'upsert',
  at: AT,
  ...partiel,
})

describe('politiques d’accès : requêtes toujours liées à l’utilisateur', () => {
  it('upsert : l’identité de session est liée et la boutique doit lui appartenir', () => {
    const r = construireUpsert('produits', 'user-A', 'bt_1_x', '1', produit, AT)
    expect(r.values[2]).toBe('user-A')
    expect(r.text).toMatch(/b\.user_id = \$3/)
    expect(r.text).toMatch(/produits\.user_id = \$3/)
    expect(r.text).not.toContain('user-A')
  })

  it('suppression : filtrée par user_id', () => {
    const r = construireSuppression('clients', 'user-A', 'bt_1_x', '4', AT)
    expect(r.text).toMatch(/user_id = \$3/)
    expect(r.values[2]).toBe('user-A')
  })

  it('boutique : on ne peut pas reprendre la boutique d’un autre', () => {
    const r = construireUpsertBoutique('user-A', 'bt_1_x', { nom: 'B', type: 'Autre', emoji: '', couleur: '', dateCreation: '2026-10-18' }, AT)
    expect(r.text).toMatch(/boutiques\.user_id = \$2/)
  })

  it('une horloge client dans le futur est plafonnée à l’heure du serveur', () => {
    const r = construireUpsert('produits', 'user-A', 'bt_1_x', '1', produit, AT)
    expect(r.text).toContain('least(')
  })

  it('opération sur la boutique d’un autre utilisateur : refusée', async () => {
    const { db } = faux((a) => {
      if (a.text.startsWith('insert into produits')) return { rows: [], rowCount: 0 }
      if (a.text.startsWith('select user_id from boutiques')) return { rows: [{ user_id: 'user-B' }], rowCount: 1 }
    })
    const statut = await appliquerOp(db, 'user-A', op({ opId: 'o1-xxxxxxxx', entite: 'produits', id: '1', data: produit }))
    expect(statut).toBe('refuse')
  })

  it('opération plus ancienne que la version du serveur : ignorée (dernier écrit gagne)', async () => {
    const { db } = faux((a) => {
      if (a.text.startsWith('insert into produits')) return { rows: [], rowCount: 0 }
      if (a.text.startsWith('select user_id from boutiques')) return { rows: [{ user_id: 'user-A' }], rowCount: 1 }
    })
    const statut = await appliquerOp(db, 'user-A', op({ opId: 'o1-xxxxxxxx', entite: 'produits', id: '1', data: produit }))
    expect(statut).toBe('ignore')
  })

  it('stock négatif : invalide', async () => {
    const { db, appels } = faux(() => undefined)
    const statut = await appliquerOp(db, 'user-A', op({ opId: 'o1-xxxxxxxx', entite: 'produits', id: '1', data: { ...produit, stock: -1 } }))
    expect(statut).toBe('invalide')
    expect(appels).toHaveLength(0)
  })

  it('vente à crédit sans client : invalide', async () => {
    const { db, appels } = faux(() => undefined)
    const vente = { id: 5, clientId: null, client: 'Passage', lignes: [], total: 100, modePaiement: 'Crédit', statut: 'Crédit', date: '2026-10-18' }
    expect(await appliquerOp(db, 'user-A', op({ opId: 'o2-xxxxxxxx', entite: 'ventes', id: '5', data: vente }))).toBe('invalide')
    expect(appels).toHaveLength(0)
  })

  it('identifiant de la donnée différent de celui de l’opération : invalide', async () => {
    const { db } = faux(() => undefined)
    expect(await appliquerOp(db, 'user-A', op({ opId: 'o3-xxxxxxxx', entite: 'produits', id: '2', data: produit }))).toBe('invalide')
  })

  it('vente : lignes et mouvements de stock écrits pour le même utilisateur', async () => {
    const { db, appels } = faux(() => undefined)
    const vente = {
      id: 5,
      clientId: 3,
      client: 'Aminata',
      lignes: [{ produitId: 1, nom: 'Sucre', quantite: 2, prixUnit: 800, prixAchat: 600 }],
      total: 1600,
      modePaiement: 'Crédit',
      statut: 'Crédit',
      date: '2026-10-18',
    }
    expect(await appliquerOp(db, 'user-A', op({ opId: 'o4-xxxxxxxx', entite: 'ventes', id: '5', data: vente }))).toBe('applique')
    const lignes = appels.find((a) => a.text.startsWith('insert into vente_lignes'))
    const mouvement = appels.find((a) => a.text.startsWith('insert into mouvements_stock'))
    expect(lignes?.values).toContain('user-A')
    expect(mouvement?.values).toContain('user-A')
    expect(mouvement?.values).toContain(-2)
  })
})

describe('lot : idempotence et isolation des erreurs', () => {
  const lot = async (db: ClientTransaction, ops: Op[]) => appliquerLot(async () => db, 'user-A', ops)

  it('une opération déjà traitée (même opId) n’est pas rejouée', async () => {
    const vus = new Set<string>()
    const { db, appels } = faux((a) => {
      if (a.text.startsWith('insert into sync_ops')) {
        const id = String(a.values[0])
        if (vus.has(id)) return { rows: [], rowCount: 0 }
        vus.add(id)
        return { rows: [{ op_id: id }], rowCount: 1 }
      }
    })
    const o = op({ opId: 'op-repete-1', entite: 'produits', id: '1', data: produit })
    const r1 = await lot(db, [o])
    const r2 = await lot(db, [o])
    expect(r1[0].statut).toBe('applique')
    expect(r2[0].statut).toBe('ignore')
    expect(appels.filter((a) => a.text.startsWith('insert into produits'))).toHaveLength(1)
  })

  it('une erreur SQL sur une opération n’empêche pas les suivantes (savepoint)', async () => {
    const { db, appels } = faux((a) => {
      if (a.text.startsWith('insert into produits') && a.values[1] === '1') throw new Error('violation de contrainte')
    })
    const r = await lot(db, [
      op({ opId: 'op-mauvaise-1', entite: 'produits', id: '1', data: produit }),
      op({ opId: 'op-bonne-0002', entite: 'produits', id: '2', data: { ...produit, id: 2 } }),
    ])
    expect(r.map((x) => x.statut)).toEqual(['invalide', 'applique'])
    expect(appels.some((a) => a.text === 'rollback to savepoint op')).toBe(true)
    expect(appels[appels.length - 1].text).toBe('commit')
  })
})

describe('routes : authentification obligatoire', () => {
  const pool = {} as Pool

  it('push sans session : 401', async () => {
    expect((await traiterPush(pool, null, '{"ops":[]}')).statut).toBe(401)
  })
  it('pull sans session : 401', async () => {
    expect((await traiterPull(pool, null, null)).statut).toBe(401)
  })
  it('push avec un corps invalide : 400', async () => {
    expect((await traiterPush(pool, 'user-A', 'pas du json')).statut).toBe(400)
    expect((await traiterPush(pool, 'user-A', JSON.stringify({ ops: [{ opId: 'x' }] }))).statut).toBe(400)
  })
  it('push trop gros : 413', async () => {
    expect((await traiterPush(pool, 'user-A', 'x'.repeat(1_000_001))).statut).toBe(413)
  })
  it('pull avec une date invalide : 400', async () => {
    expect((await traiterPull(pool, 'user-A', 'demain')).statut).toBe(400)
  })
})
