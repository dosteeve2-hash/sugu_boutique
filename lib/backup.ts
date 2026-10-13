export const FORMAT_SAUVEGARDE = 'sugu-sauvegarde'
export const VERSION_SAUVEGARDE = 1
export const PREFIXE_CLES = 'sugu_'
export const CLE_DERNIER_EXPORT = 'sugu_dernier_export'

export type Sauvegarde = {
  format: typeof FORMAT_SAUVEGARDE
  version: number
  exporteLe: string
  donnees: Record<string, string>
}

export type ResultatAnalyse = { ok: true; sauvegarde: Sauvegarde } | { ok: false; erreur: string }

export function collecterDonnees(stockage: Storage): Record<string, string> {
  const donnees: Record<string, string> = {}
  for (let i = 0; i < stockage.length; i++) {
    const cle = stockage.key(i)
    if (!cle || !cle.startsWith(PREFIXE_CLES) || cle === CLE_DERNIER_EXPORT) continue
    const valeur = stockage.getItem(cle)
    if (valeur !== null) donnees[cle] = valeur
  }
  return donnees
}

export function creerSauvegarde(stockage: Storage, maintenant: Date = new Date()): Sauvegarde {
  return {
    format: FORMAT_SAUVEGARDE,
    version: VERSION_SAUVEGARDE,
    exporteLe: maintenant.toISOString(),
    donnees: collecterDonnees(stockage),
  }
}

export function nomFichierSauvegarde(maintenant: Date = new Date()): string {
  return `sugu-sauvegarde-${maintenant.toISOString().slice(0, 10)}.json`
}

export function analyserSauvegarde(texte: string): ResultatAnalyse {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    return { ok: false, erreur: "Ce fichier n'est pas une sauvegarde SUGU (lecture impossible)." }
  }
  if (typeof brut !== 'object' || brut === null) {
    return { ok: false, erreur: "Ce fichier n'est pas une sauvegarde SUGU." }
  }
  const candidat = brut as Record<string, unknown>
  if (candidat.format !== FORMAT_SAUVEGARDE) {
    return { ok: false, erreur: "Ce fichier n'est pas une sauvegarde SUGU." }
  }
  if (typeof candidat.version !== 'number' || candidat.version > VERSION_SAUVEGARDE) {
    return { ok: false, erreur: 'Cette sauvegarde vient d’une version plus récente de SUGU.' }
  }
  const donnees = candidat.donnees
  if (typeof donnees !== 'object' || donnees === null || Array.isArray(donnees)) {
    return { ok: false, erreur: 'La sauvegarde est vide ou abîmée.' }
  }
  const propres: Record<string, string> = {}
  for (const [cle, valeur] of Object.entries(donnees as Record<string, unknown>)) {
    if (!cle.startsWith(PREFIXE_CLES) || cle === CLE_DERNIER_EXPORT || typeof valeur !== 'string') {
      return { ok: false, erreur: 'La sauvegarde contient des données inattendues.' }
    }
    try {
      JSON.parse(valeur)
    } catch {
      if (cle !== 'sugu_boutique_active' && cle !== 'sugu_langue') {
        return { ok: false, erreur: 'La sauvegarde contient des données abîmées.' }
      }
    }
    propres[cle] = valeur
  }
  if (!('sugu_boutiques' in propres)) {
    return { ok: false, erreur: 'La sauvegarde ne contient aucune boutique.' }
  }
  return {
    ok: true,
    sauvegarde: {
      format: FORMAT_SAUVEGARDE,
      version: candidat.version,
      exporteLe: typeof candidat.exporteLe === 'string' ? candidat.exporteLe : '',
      donnees: propres,
    },
  }
}

export function restaurerSauvegarde(stockage: Storage, sauvegarde: Sauvegarde): number {
  const aSupprimer: string[] = []
  for (let i = 0; i < stockage.length; i++) {
    const cle = stockage.key(i)
    if (cle && cle.startsWith(PREFIXE_CLES) && cle !== CLE_DERNIER_EXPORT) aSupprimer.push(cle)
  }
  aSupprimer.forEach((cle) => stockage.removeItem(cle))
  const entrees = Object.entries(sauvegarde.donnees)
  entrees.forEach(([cle, valeur]) => stockage.setItem(cle, valeur))
  return entrees.length
}

export function joursDepuisExport(stockage: Storage, maintenant: Date = new Date()): number | null {
  const brut = stockage.getItem(CLE_DERNIER_EXPORT)
  if (!brut) return null
  const date = new Date(brut)
  if (Number.isNaN(date.getTime())) return null
  return Math.floor((maintenant.getTime() - date.getTime()) / 86_400_000)
}
