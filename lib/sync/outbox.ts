import { ENTITES, type Entite, type EntiteSync, type Op } from '@/lib/sync/types'

export type Stockage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

export const CLES = {
  utilisateur: 'sugucloud_utilisateur',
  outbox: 'sugucloud_outbox',
  curseur: 'sugucloud_curseur',
  migre: 'sugucloud_migre',
  rejets: 'sugucloud_rejets',
} as const

export const CLE_BOUTIQUES = 'sugu_boutiques'

const MOTIF_CLE = new RegExp(`^sugu_(bt_[A-Za-z0-9_]+)_(${ENTITES.join('|')})$`)

export type CibleEcriture = { entite: 'boutiques' } | { entite: Entite; boutiqueId: string }

export function analyserCle(cle: string): CibleEcriture | null {
  if (cle === CLE_BOUTIQUES) return { entite: 'boutiques' }
  const m = MOTIF_CLE.exec(cle)
  if (!m) return null
  return { entite: m[2] as Entite, boutiqueId: m[1] }
}

export function cleDonnees(boutiqueId: string, entite: Entite): string {
  return `sugu_${boutiqueId}_${entite}`
}

export function cleOp(op: Pick<Op, 'entite' | 'boutiqueId' | 'id'>): string {
  return `${op.entite}|${op.boutiqueId}|${op.id}`
}

export function lireOutbox(s: Stockage): Op[] {
  try {
    const brut = s.getItem(CLES.outbox)
    const liste: unknown = brut ? JSON.parse(brut) : []
    return Array.isArray(liste) ? (liste as Op[]) : []
  } catch {
    return []
  }
}

export function ecrireOutbox(s: Stockage, ops: Op[]): void {
  try {
    if (ops.length === 0) s.removeItem(CLES.outbox)
    else s.setItem(CLES.outbox, JSON.stringify(ops))
  } catch {
    // espace plein : l'opération reste perdue, la prochaine sauvegarde complète la rattrape
  }
}

/** Fusionne les nouvelles opérations : pour une même entité, seule la plus récente est conservée. */
export function fusionnerOps(existantes: Op[], nouvelles: Op[]): Op[] {
  const index = new Map<string, Op>()
  for (const op of existantes) index.set(cleOp(op), op)
  for (const op of nouvelles) {
    index.delete(cleOp(op))
    index.set(cleOp(op), op)
  }
  return [...index.values()]
}

type AvecId = { id: number | string }

export function diffCollection<T extends AvecId>(avant: T[], apres: T[]): { upserts: T[]; suppressions: Array<T['id']> } {
  const anciens = new Map<string, T>()
  for (const x of avant) anciens.set(String(x.id), x)
  const presents = new Set<string>()
  const upserts: T[] = []
  for (const x of apres) {
    const k = String(x.id)
    presents.add(k)
    const ancien = anciens.get(k)
    if (!ancien || JSON.stringify(ancien) !== JSON.stringify(x)) upserts.push(x)
  }
  const suppressions: Array<T['id']> = []
  for (const x of avant) if (!presents.has(String(x.id))) suppressions.push(x.id)
  return { upserts, suppressions }
}

export function genererIdOp(maintenant: number = Date.now()): string {
  const alea =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 12)
      : Math.random().toString(36).slice(2, 14)
  return `${maintenant.toString(36)}-${alea}`
}

export function opsDepuisEcriture(
  cle: string,
  avant: unknown,
  apres: unknown,
  maintenant: Date,
  genId: () => string = genererIdOp
): Op[] {
  const cible = analyserCle(cle)
  if (!cible || !Array.isArray(avant) || !Array.isArray(apres)) return []
  const at = maintenant.toISOString()
  const { upserts, suppressions } = diffCollection(avant as AvecId[], apres as AvecId[])
  const entite: EntiteSync = cible.entite
  const boutiqueFixe = cible.entite === 'boutiques' ? null : cible.boutiqueId
  const ops: Op[] = []
  for (const x of upserts) {
    ops.push({ opId: genId(), entite, boutiqueId: boutiqueFixe ?? String(x.id), id: String(x.id), type: 'upsert', data: x, at })
  }
  for (const id of suppressions) {
    ops.push({ opId: genId(), entite, boutiqueId: boutiqueFixe ?? String(id), id: String(id), type: 'delete', at })
  }
  return ops
}

export function lireTableau(s: Stockage, cle: string): AvecId[] {
  try {
    const brut = s.getItem(cle)
    const v: unknown = brut ? JSON.parse(brut) : []
    return Array.isArray(v) ? (v as AvecId[]) : []
  } catch {
    return []
  }
}

/** Toutes les données locales sous forme d'opérations d'envoi, pour la première sauvegarde. */
export function opsDeToutesLesDonnees(s: Stockage, maintenant: Date, genId: () => string = genererIdOp): Op[] {
  const at = maintenant.toISOString()
  const ops: Op[] = []
  const boutiques = lireTableau(s, CLE_BOUTIQUES) as Array<{ id: string }>
  for (const b of boutiques) {
    ops.push({ opId: genId(), entite: 'boutiques', boutiqueId: b.id, id: b.id, type: 'upsert', data: b, at })
  }
  for (const b of boutiques) {
    for (const entite of ENTITES) {
      for (const x of lireTableau(s, cleDonnees(b.id, entite))) {
        ops.push({ opId: genId(), entite, boutiqueId: b.id, id: String(x.id), type: 'upsert', data: x, at })
      }
    }
  }
  return ops
}

export type ResumeLocal = { boutiques: number; produits: number; clients: number; ventes: number }

export function resumeDonneesLocales(s: Stockage): ResumeLocal {
  const boutiques = lireTableau(s, CLE_BOUTIQUES) as Array<{ id: string }>
  const total = (entite: Entite) => boutiques.reduce((a, b) => a + lireTableau(s, cleDonnees(b.id, entite)).length, 0)
  return { boutiques: boutiques.length, produits: total('produits'), clients: total('clients'), ventes: total('ventes') }
}
