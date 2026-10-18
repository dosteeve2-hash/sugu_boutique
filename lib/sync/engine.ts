import {
  CLES,
  CLE_BOUTIQUES,
  cleDonnees,
  cleOp,
  ecrireOutbox,
  fusionnerOps,
  lireOutbox,
  lireTableau,
  opsDeToutesLesDonnees,
  opsDepuisEcriture,
  type Stockage,
} from '@/lib/sync/outbox'
import { ENTITES, TAILLE_LOT, type EnregistrementTire, type Op, type ReponseTirer, type ResultatOp, type StatutSauvegarde } from '@/lib/sync/types'

export type DepsMoteur = {
  stockage: Stockage
  appel: typeof fetch
  maintenant: () => Date
  enLigne: () => boolean
  surChangementStatut: () => void
  surDonneesChangees: () => void
}

const CHEVAUCHEMENT_MS = 10_000

export type Moteur = ReturnType<typeof creerMoteur>

/**
 * Moteur de synchronisation.
 * - Les écritures locales (localStorage) sont déjà faites ; ce moteur en déduit des opérations (diff) rangées dans une
 *   file d'attente persistante, envoyées par lots au serveur, au plus une fois grâce à l'opId.
 * - Conflit : dernier écrit gagne (horodatage client de l'opération, plafonné à l'heure du serveur).
 * - Les enregistrements reçus du serveur n'écrasent jamais une entité qui a une opération en attente.
 */
export function creerMoteur(deps: DepsMoteur) {
  const { stockage, appel } = deps
  let horsLigne = false
  let sessionExpiree = false
  let enCours: Promise<void> | null = null

  const utilisateur = (): string | null => stockage.getItem(CLES.utilisateur)
  const enAttente = (): number => lireOutbox(stockage).length

  const statut = (): StatutSauvegarde => {
    if (!utilisateur()) return 'sans-compte'
    if (sessionExpiree) return 'session-expiree'
    if (horsLigne || !deps.enLigne()) return 'hors-ligne'
    return enAttente() > 0 || enCours ? 'en-attente' : 'a-jour'
  }

  const signaler = () => deps.surChangementStatut()

  function activer(idUtilisateur: string) {
    stockage.setItem(CLES.utilisateur, idUtilisateur)
    sessionExpiree = false
    signaler()
  }

  function desactiver() {
    stockage.removeItem(CLES.utilisateur)
    stockage.removeItem(CLES.outbox)
    stockage.removeItem(CLES.curseur)
    sessionExpiree = false
    horsLigne = false
    signaler()
  }

  function noterEcriture(cle: string, avant: unknown, apres: unknown) {
    if (!utilisateur()) return
    const nouvelles = opsDepuisEcriture(cle, avant, apres, deps.maintenant())
    if (nouvelles.length === 0) return
    ecrireOutbox(stockage, fusionnerOps(lireOutbox(stockage), nouvelles))
    signaler()
  }

  function enfiler(ops: Op[]) {
    if (ops.length === 0) return
    ecrireOutbox(stockage, fusionnerOps(lireOutbox(stockage), ops))
    signaler()
  }

  function enfilerToutesLesDonnees(): number {
    const ops = opsDeToutesLesDonnees(stockage, deps.maintenant())
    enfiler(ops)
    return ops.length
  }

  async function envoyerUnLot(): Promise<'fini' | 'suite' | 'arret'> {
    const file = lireOutbox(stockage)
    if (file.length === 0) return 'fini'
    const lot = file.slice(0, TAILLE_LOT)
    let reponse: Response
    try {
      reponse = await appel('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ops: lot }),
        credentials: 'same-origin',
      })
    } catch {
      horsLigne = true
      return 'arret'
    }
    if (reponse.status === 401) {
      sessionExpiree = true
      return 'arret'
    }
    if (!reponse.ok) {
      // 5xx ou limite de débit : on réessaiera plus tard, rien n'est perdu
      horsLigne = reponse.status >= 500 || reponse.status === 429
      if (reponse.status === 400 || reponse.status === 413) {
        // lot jamais acceptable : on écarte la tête de file pour ne pas bloquer le reste
        const ids = new Set(lot.map((o) => o.opId))
        ecrireOutbox(stockage, lireOutbox(stockage).filter((o) => !ids.has(o.opId)))
        return 'suite'
      }
      return 'arret'
    }
    let corps: { resultats?: ResultatOp[] }
    try {
      corps = (await reponse.json()) as { resultats?: ResultatOp[] }
    } catch {
      horsLigne = true
      return 'arret'
    }
    horsLigne = false
    const rejets = (corps.resultats ?? []).filter((r) => r.statut === 'refuse' || r.statut === 'invalide').length
    if (rejets > 0) {
      const avant = Number(stockage.getItem(CLES.rejets) ?? '0') || 0
      stockage.setItem(CLES.rejets, String(avant + rejets))
    }
    const traites = new Set((corps.resultats ?? []).map((r) => r.opId))
    ecrireOutbox(stockage, lireOutbox(stockage).filter((o) => !traites.has(o.opId)))
    return lireOutbox(stockage).length > 0 && traites.size > 0 ? 'suite' : 'fini'
  }

  async function vider(): Promise<void> {
    if (!utilisateur() || sessionExpiree) return
    if (!deps.enLigne()) {
      signaler()
      return
    }
    for (let i = 0; i < 200; i++) {
      const etat = await envoyerUnLot()
      signaler()
      if (etat !== 'suite') break
    }
  }

  function appliquerEnregistrements(enregistrements: EnregistrementTire[]) {
    const enAttenteCles = new Set(lireOutbox(stockage).map(cleOp))
    const parCle = new Map<string, EnregistrementTire[]>()
    for (const e of enregistrements) {
      if (enAttenteCles.has(cleOp(e))) continue
      const cle = e.entite === 'boutiques' ? CLE_BOUTIQUES : cleDonnees(e.boutiqueId, e.entite)
      const liste = parCle.get(cle) ?? []
      liste.push(e)
      parCle.set(cle, liste)
    }
    for (const [cle, liste] of parCle) {
      const courant = lireTableau(stockage, cle)
      const index = new Map(courant.map((x) => [String(x.id), x]))
      for (const e of liste) {
        if (e.supprime) {
          index.delete(e.id)
          if (e.entite === 'boutiques') {
            for (const entite of ENTITES) stockage.removeItem(cleDonnees(e.id, entite))
          }
        } else if (e.data) {
          index.set(e.id, e.data as { id: number | string })
        }
      }
      try {
        stockage.setItem(cle, JSON.stringify([...index.values()]))
      } catch {
        // espace plein : la prochaine synchronisation réessaiera
      }
    }
    if (parCle.size > 0) deps.surDonneesChangees()
  }

  async function tirer(): Promise<void> {
    if (!utilisateur() || sessionExpiree || !deps.enLigne()) return
    const curseur = stockage.getItem(CLES.curseur) ?? new Date(0).toISOString()
    let reponse: Response
    try {
      reponse = await appel(`/api/sync/pull?depuis=${encodeURIComponent(curseur)}`, { credentials: 'same-origin' })
    } catch {
      horsLigne = true
      signaler()
      return
    }
    if (reponse.status === 401) {
      sessionExpiree = true
      signaler()
      return
    }
    if (!reponse.ok) {
      horsLigne = reponse.status >= 500
      signaler()
      return
    }
    const corps = (await reponse.json()) as ReponseTirer
    horsLigne = false
    appliquerEnregistrements(corps.enregistrements)
    const prochain = new Date(new Date(corps.heureServeur).getTime() - CHEVAUCHEMENT_MS).toISOString()
    stockage.setItem(CLES.curseur, prochain)
    signaler()
  }

  /** Une seule synchronisation à la fois : envoi d'abord, puis réception. */
  function synchroniser(): Promise<void> {
    if (enCours) return enCours
    enCours = (async () => {
      try {
        signaler()
        await vider()
        await tirer()
      } finally {
        enCours = null
        signaler()
      }
    })()
    return enCours
  }

  function signalerReseau(enLigne: boolean) {
    horsLigne = !enLigne
    signaler()
  }

  return {
    statut,
    enAttente,
    utilisateur,
    activer,
    desactiver,
    noterEcriture,
    enfiler,
    enfilerToutesLesDonnees,
    vider,
    tirer,
    synchroniser,
    signalerReseau,
    marquerSessionExpiree: () => {
      sessionExpiree = true
      signaler()
    },
  }
}
