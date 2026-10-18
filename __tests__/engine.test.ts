import { beforeEach, describe, expect, it, vi } from 'vitest'
import { creerMoteur } from '@/lib/sync/engine'
import { CLES, lireOutbox } from '@/lib/sync/outbox'
import { estMigre, marquerMigre, statutAffiche, viderDonneesLocales } from '@/lib/sync/session'

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

const produit = (id: number, stock: number) => ({ id, nom: `P${id}`, categorie: '', prixAchat: 1, prixVente: 2, stock, stockMin: 0 })
const CLE_PRODUITS = 'sugu_bt_1_x_produits'

function reponseJson(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), { status, headers: { 'Content-Type': 'application/json' } })
}

function creer(opts?: { enLigne?: boolean }) {
  const stockage = new FauxStockage()
  const etat = { enLigne: opts?.enLigne ?? true }
  const appel = vi.fn<(...a: Parameters<typeof fetch>) => Promise<Response>>()
  const surDonnees = vi.fn()
  const moteur = creerMoteur({
    stockage,
    appel: appel as unknown as typeof fetch,
    maintenant: () => new Date('2026-10-18T10:00:00.000Z'),
    enLigne: () => etat.enLigne,
    surChangementStatut: () => undefined,
    surDonneesChangees: surDonnees,
  })
  return { stockage, etat, appel, moteur, surDonnees }
}

const toutApplique = (corps: string) => {
  const { ops } = JSON.parse(corps) as { ops: Array<{ opId: string }> }
  return reponseJson({ resultats: ops.map((o) => ({ opId: o.opId, statut: 'applique' })) })
}

describe('moteur de synchronisation', () => {
  let t: ReturnType<typeof creer>
  beforeEach(() => {
    t = creer()
  })

  it('mode sans compte : aucune file, aucun appel réseau', async () => {
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 5)])
    await t.moteur.synchroniser()
    expect(lireOutbox(t.stockage)).toHaveLength(0)
    expect(t.appel).not.toHaveBeenCalled()
    expect(t.moteur.statut()).toBe('sans-compte')
  })

  it('avec compte : une vente hors ligne reste en attente puis part à la reconnexion', async () => {
    t.moteur.activer('u1')
    t.etat.enLigne = false
    t.moteur.signalerReseau(false)
    t.moteur.noterEcriture(CLE_PRODUITS, [produit(1, 5)], [produit(1, 4)])
    await t.moteur.synchroniser()
    expect(t.appel).not.toHaveBeenCalled()
    expect(t.moteur.enAttente()).toBe(1)
    expect(t.moteur.statut()).toBe('hors-ligne')

    t.etat.enLigne = true
    t.moteur.signalerReseau(true)
    t.appel.mockImplementation(async (url, init) => {
      if (String(url).startsWith('/api/sync/push')) return toutApplique(String(init?.body))
      return reponseJson({ heureServeur: '2026-10-18T10:00:05.000Z', enregistrements: [] })
    })
    await t.moteur.synchroniser()
    expect(t.moteur.enAttente()).toBe(0)
    expect(t.moteur.statut()).toBe('a-jour')
  })

  it('idempotence : après un échec réseau, le renvoi reprend les mêmes opId', async () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 5)])
    const idsAvant = lireOutbox(t.stockage).map((o) => o.opId)
    t.appel.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await t.moteur.vider()
    expect(t.moteur.enAttente()).toBe(1)
    expect(t.moteur.statut()).toBe('hors-ligne')

    const envoyes: string[] = []
    t.appel.mockImplementation(async (_url, init) => {
      const corps = String(init?.body)
      envoyes.push(...(JSON.parse(corps) as { ops: Array<{ opId: string }> }).ops.map((o) => o.opId))
      return toutApplique(corps)
    })
    await t.moteur.vider()
    expect(envoyes).toEqual(idsAvant)
    expect(t.moteur.enAttente()).toBe(0)
  })

  it('dernier écrit gagne dans la file : deux ventes successives du même produit ne font qu’une opération', () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [produit(1, 5)], [produit(1, 4)])
    t.moteur.noterEcriture(CLE_PRODUITS, [produit(1, 4)], [produit(1, 3)])
    const file = lireOutbox(t.stockage)
    expect(file).toHaveLength(1)
    expect((file[0].data as { stock: number }).stock).toBe(3)
  })

  it('session expirée (401) : rien n’est perdu, statut dédié', async () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 5)])
    t.appel.mockResolvedValue(reponseJson({ erreur: 'non-connecte' }, 401))
    await t.moteur.vider()
    expect(t.moteur.statut()).toBe('session-expiree')
    expect(t.moteur.enAttente()).toBe(1)
  })

  it('erreur serveur (500) : la file est conservée', async () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 5)])
    t.appel.mockResolvedValue(reponseJson({ erreur: 'serveur' }, 500))
    await t.moteur.vider()
    expect(t.moteur.enAttente()).toBe(1)
  })

  it('envoie par lots de 100 au plus', async () => {
    t.moteur.activer('u1')
    const beaucoup = Array.from({ length: 250 }, (_, i) => produit(i + 1, 1))
    t.moteur.noterEcriture(CLE_PRODUITS, [], beaucoup)
    const tailles: number[] = []
    t.appel.mockImplementation(async (_u, init) => {
      const corps = String(init?.body)
      tailles.push((JSON.parse(corps) as { ops: unknown[] }).ops.length)
      return toutApplique(corps)
    })
    await t.moteur.vider()
    expect(tailles).toEqual([100, 100, 50])
    expect(t.moteur.enAttente()).toBe(0)
  })

  it('compte les éléments refusés par le serveur', async () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 5)])
    t.appel.mockImplementation(async (_u, init) => {
      const { ops } = JSON.parse(String(init?.body)) as { ops: Array<{ opId: string }> }
      return reponseJson({ resultats: ops.map((o) => ({ opId: o.opId, statut: 'invalide' })) })
    })
    await t.moteur.vider()
    expect(t.moteur.enAttente()).toBe(0)
    expect(t.stockage.getItem(CLES.rejets)).toBe('1')
  })

  describe('réception', () => {
    const tirerAvec = async (enregistrements: unknown[]) => {
      t.appel.mockResolvedValue(reponseJson({ heureServeur: '2026-10-18T10:00:30.000Z', enregistrements }))
      await t.moteur.tirer()
    }

    it('restaure les données du serveur sur un téléphone vide', async () => {
      t.moteur.activer('u1')
      await tirerAvec([
        { entite: 'boutiques', boutiqueId: 'bt_1_x', id: 'bt_1_x', supprime: false, data: { id: 'bt_1_x', nom: 'B' } },
        { entite: 'produits', boutiqueId: 'bt_1_x', id: '1', supprime: false, data: produit(1, 8) },
      ])
      expect(JSON.parse(t.stockage.getItem('sugu_boutiques') ?? '[]')).toHaveLength(1)
      expect(JSON.parse(t.stockage.getItem(CLE_PRODUITS) ?? '[]')[0].stock).toBe(8)
      expect(t.surDonnees).toHaveBeenCalled()
      expect(t.stockage.getItem(CLES.curseur)).toBe('2026-10-18T10:00:20.000Z')
    })

    it('n’écrase pas une entité qui a une modification locale en attente', async () => {
      t.moteur.activer('u1')
      t.stockage.setItem(CLE_PRODUITS, JSON.stringify([produit(1, 3)]))
      t.moteur.noterEcriture(CLE_PRODUITS, [produit(1, 5)], [produit(1, 3)])
      await tirerAvec([{ entite: 'produits', boutiqueId: 'bt_1_x', id: '1', supprime: false, data: produit(1, 99) }])
      expect(JSON.parse(t.stockage.getItem(CLE_PRODUITS) ?? '[]')[0].stock).toBe(3)
    })

    it('applique les suppressions faites sur un autre appareil', async () => {
      t.moteur.activer('u1')
      t.stockage.setItem(CLE_PRODUITS, JSON.stringify([produit(1, 3), produit(2, 3)]))
      await tirerAvec([{ entite: 'produits', boutiqueId: 'bt_1_x', id: '1', supprime: true }])
      expect(JSON.parse(t.stockage.getItem(CLE_PRODUITS) ?? '[]').map((p: { id: number }) => p.id)).toEqual([2])
    })

    it('une boutique supprimée ailleurs vide aussi ses données locales', async () => {
      t.moteur.activer('u1')
      t.stockage.setItem('sugu_boutiques', JSON.stringify([{ id: 'bt_1_x' }]))
      t.stockage.setItem(CLE_PRODUITS, JSON.stringify([produit(1, 3)]))
      await tirerAvec([{ entite: 'boutiques', boutiqueId: 'bt_1_x', id: 'bt_1_x', supprime: true }])
      expect(JSON.parse(t.stockage.getItem('sugu_boutiques') ?? '[]')).toHaveLength(0)
      expect(t.stockage.getItem(CLE_PRODUITS)).toBeNull()
    })

    it('réception refusée (401) : session expirée', async () => {
      t.moteur.activer('u1')
      t.appel.mockResolvedValue(reponseJson({}, 401))
      await t.moteur.tirer()
      expect(t.moteur.statut()).toBe('session-expiree')
    })
  })

  it('première sauvegarde : toutes les données locales entrent dans la file', () => {
    t.moteur.activer('u1')
    t.stockage.setItem('sugu_boutiques', JSON.stringify([{ id: 'bt_1_x', nom: 'B', type: 'Autre', emoji: '', couleur: '', dateCreation: '' }]))
    t.stockage.setItem(CLE_PRODUITS, JSON.stringify([produit(1, 1), produit(2, 2)]))
    expect(t.moteur.enfilerToutesLesDonnees()).toBe(3)
    expect(t.moteur.enAttente()).toBe(3)
  })

  it('la désactivation efface file et curseur', () => {
    t.moteur.activer('u1')
    t.moteur.noterEcriture(CLE_PRODUITS, [], [produit(1, 1)])
    t.moteur.desactiver()
    expect(t.stockage.getItem(CLES.outbox)).toBeNull()
    expect(t.moteur.statut()).toBe('sans-compte')
  })
})

describe('session et statut affiché', () => {
  it('tant que la première sauvegarde n’est pas faite, "à jour" devient "à faire"', () => {
    expect(statutAffiche('a-jour', false)).toBe('a-faire')
    expect(statutAffiche('a-jour', true)).toBe('a-jour')
    expect(statutAffiche('hors-ligne', false)).toBe('hors-ligne')
  })
  it('mémorise la migration par utilisateur', () => {
    const s = new FauxStockage()
    expect(estMigre(s, 'u1')).toBe(false)
    marquerMigre(s, 'u1')
    expect(estMigre(s, 'u1')).toBe(true)
    expect(estMigre(s, 'u2')).toBe(false)
  })
  it('la déconnexion vide les données du commerçant mais garde la langue', () => {
    const s = new FauxStockage()
    s.setItem('sugu_boutiques', '[]')
    s.setItem('sugu_bt_1_x_ventes', '[]')
    s.setItem('sugucloud_outbox', '[]')
    s.setItem('sugu_langue', 'fr')
    viderDonneesLocales(s)
    expect(s.length).toBe(1)
    expect(s.getItem('sugu_langue')).toBe('fr')
  })
})
