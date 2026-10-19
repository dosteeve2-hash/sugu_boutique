import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Pool } from 'pg'
import { traiterPull, traiterPush } from '@/lib/server/sync-route'
import type { Op } from '@/lib/sync/types'

/**
 * Test d'intégration contre une vraie base Postgres (Neon).
 * Désactivé par défaut : SUGU_TEST_DB=1 DATABASE_URL=... npx vitest run __tests__/integration-db.test.ts
 */
const actif = process.env.SUGU_TEST_DB === '1' && Boolean(process.env.DATABASE_URL)

describe.skipIf(!actif)('isolation entre utilisateurs (base réelle)', () => {
  let pool: Pool
  const marque = `it${Date.now().toString(36)}`
  const A = `${marque}-a`
  const B = `${marque}-b`
  const bt = `bt_1_${marque}`
  let n = 0
  const opId = () => `${marque}-op-${++n}-xxxxxxxx`
  const maintenant = () => new Date().toISOString()
  const produit = (id: number, stock: number) => ({ id, nom: `P${id}`, categorie: '', prixAchat: 10, prixVente: 20, stock, stockMin: 1 })
  const boutique = { id: bt, nom: 'Boutique test', type: 'Autre', emoji: '🏪', couleur: '#D4AF37', dateCreation: '2026-10-18' }

  const push = async (userId: string, ops: Op[]) => {
    const r = await traiterPush(pool, userId, JSON.stringify({ ops }))
    expect(r.statut).toBe(200)
    return (r.corps as { resultats: Array<{ opId: string; statut: string }> }).resultats
  }
  const pull = async (userId: string, depuis: string | null = null) => {
    const r = await traiterPull(pool, userId, depuis)
    expect(r.statut).toBe(200)
    return r.corps as { enregistrements: Array<{ entite: string; id: string; supprime: boolean; data?: Record<string, unknown> }> }
  }

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
    for (const id of [A, B]) {
      await pool.query(
        'insert into "user" ("id","name","email","emailVerified") values ($1,$1,$2,false)',
        [id, `${id}@sugu.test`]
      )
    }
  })

  afterAll(async () => {
    await pool.query('delete from "user" where "id" = any($1)', [[A, B]])
    await pool.end()
  })

  it('A sauvegarde sa boutique et ses produits ; B ne voit rien', async () => {
    const at = maintenant()
    const res = await push(A, [
      { opId: opId(), entite: 'boutiques', boutiqueId: bt, id: bt, type: 'upsert', data: boutique, at },
      { opId: opId(), entite: 'produits', boutiqueId: bt, id: '1', type: 'upsert', data: produit(1, 5), at },
    ])
    expect(res.map((r) => r.statut)).toEqual(['applique', 'applique'])
    const a = await pull(A)
    expect(a.enregistrements.map((e) => e.entite).sort()).toEqual(['boutiques', 'produits'])
    const b = await pull(B)
    expect(b.enregistrements).toHaveLength(0)
  })

  it('B ne peut ni écrire dans la boutique de A, ni la reprendre', async () => {
    const at = maintenant()
    const res = await push(B, [
      { opId: opId(), entite: 'produits', boutiqueId: bt, id: '2', type: 'upsert', data: produit(2, 1), at },
      { opId: opId(), entite: 'boutiques', boutiqueId: bt, id: bt, type: 'upsert', data: { ...boutique, nom: 'Piratée' }, at },
      { opId: opId(), entite: 'produits', boutiqueId: bt, id: '1', type: 'delete', at },
    ])
    expect(res[0].statut).toBe('refuse')
    expect(res[1].statut).toBe('refuse')
    const a = await pull(A)
    expect(a.enregistrements.find((e) => e.entite === 'boutiques')?.data?.nom).toBe('Boutique test')
    expect(a.enregistrements.find((e) => e.entite === 'produits' && e.id === '1')?.supprime).toBe(false)
    expect(a.enregistrements.some((e) => e.id === '2')).toBe(false)
  })

  it('idempotence : rejouer le même lot ne change rien', async () => {
    const ops: Op[] = [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '3', type: 'upsert', data: produit(3, 7), at: maintenant() }]
    expect((await push(A, ops))[0].statut).toBe('applique')
    expect((await push(A, ops))[0].statut).toBe('ignore')
    const { rows } = await pool.query('select count(*)::int n from produits where user_id = $1 and boutique_id = $2', [A, bt])
    expect(rows[0].n).toBe(2)
  })

  it('dernier écrit gagne : une écriture plus ancienne est ignorée', async () => {
    const recent = maintenant()
    const ancien = new Date(Date.now() - 60_000).toISOString()
    await push(A, [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '1', type: 'upsert', data: produit(1, 4), at: recent }])
    const res = await push(A, [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '1', type: 'upsert', data: produit(1, 99), at: ancien }])
    expect(res[0].statut).toBe('ignore')
    const { rows } = await pool.query('select stock from produits where user_id = $1 and id = 1', [A])
    expect(Number(rows[0].stock)).toBe(4)
  })

  it('une horloge dans le futur ne peut pas verrouiller une entité', async () => {
    const futur = new Date(Date.now() + 10 * 86_400_000).toISOString()
    await push(A, [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '4', type: 'upsert', data: produit(4, 1), at: futur }])
    const res = await push(A, [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '4', type: 'upsert', data: produit(4, 2), at: new Date(Date.now() + 1000).toISOString() }])
    expect(res[0].statut).toBe('applique')
  })

  it('contrainte : stock négatif refusé par la base même en contournant la validation', async () => {
    await expect(
      pool.query('update produits set stock = -1 where user_id = $1 and id = 1', [A])
    ).rejects.toThrow()
  })

  it('suppression : pierre tombale visible par les autres appareils', async () => {
    await push(A, [{ opId: opId(), entite: 'produits', boutiqueId: bt, id: '3', type: 'delete', at: maintenant() }])
    const a = await pull(A)
    expect(a.enregistrements.find((e) => e.entite === 'produits' && e.id === '3')?.supprime).toBe(true)
  })

  it('vente à crédit : lignes, mouvement de stock, et refus sans client', async () => {
    const at = maintenant()
    const vente = {
      id: 10, clientId: 7, client: 'Moussa',
      lignes: [{ produitId: 1, nom: 'P1', quantite: 2, prixUnit: 20, prixAchat: 10 }],
      total: 40, modePaiement: 'Crédit', statut: 'Crédit', date: '2026-10-18',
    }
    const res = await push(A, [
      { opId: opId(), entite: 'ventes', boutiqueId: bt, id: '10', type: 'upsert', data: vente, at },
      { opId: opId(), entite: 'ventes', boutiqueId: bt, id: '11', type: 'upsert', data: { ...vente, id: 11, clientId: null }, at },
    ])
    expect(res.map((r) => r.statut)).toEqual(['applique', 'invalide'])
    const a = await pull(A)
    const v = a.enregistrements.find((e) => e.entite === 'ventes' && e.id === '10')
    expect((v?.data?.lignes as unknown[]).length).toBe(1)
    const { rows } = await pool.query("select delta from mouvements_stock where user_id = $1 and motif = 'vente'", [A])
    expect(Number(rows[0].delta)).toBe(-2)
  })
})
