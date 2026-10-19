import { CLES, resumeDonneesLocales, type Stockage } from '@/lib/sync/outbox'
import type { StatutSauvegarde } from '@/lib/sync/types'

export function aDonneesLocales(s: Stockage): boolean {
  const r = resumeDonneesLocales(s)
  return r.boutiques > 0
}

export function estMigre(s: Stockage, idUtilisateur: string): boolean {
  return s.getItem(`${CLES.migre}_${idUtilisateur}`) === '1'
}

export function marquerMigre(s: Stockage, idUtilisateur: string) {
  s.setItem(`${CLES.migre}_${idUtilisateur}`, '1')
}

/** Statut affiché : tant que la première sauvegarde n'a pas été faite, "à faire" l'emporte sur "à jour". */
export function statutAffiche(brut: StatutSauvegarde, migre: boolean): StatutSauvegarde {
  if (brut === 'a-jour' && !migre) return 'a-faire'
  return brut
}

const A_CONSERVER = new Set(['sugu_langue'])

/** Vide les données commerçant de ce téléphone (après déconnexion, une fois tout envoyé). */
export function viderDonneesLocales(s: Stockage): number {
  const aSupprimer: string[] = []
  for (let i = 0; i < s.length; i++) {
    const cle = s.key(i)
    if (!cle) continue
    if ((cle.startsWith('sugu_') && !A_CONSERVER.has(cle)) || cle.startsWith('sugucloud_')) aSupprimer.push(cle)
  }
  aSupprimer.forEach((c) => s.removeItem(c))
  return aSupprimer.length
}
