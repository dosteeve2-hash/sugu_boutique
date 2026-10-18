import type { Moteur } from '@/lib/sync/engine'

export const EVENEMENT_DONNEES = 'sugu-donnees-changees'
export const EVENEMENT_STATUT = 'sugu-sauvegarde-statut'

let moteur: Moteur | null = null

export function enregistrerMoteur(m: Moteur | null) {
  moteur = m
}

export function obtenirMoteur(): Moteur | null {
  return moteur
}

export function noterEcriture(cle: string, avant: unknown, apres: unknown) {
  moteur?.noterEcriture(cle, avant, apres)
}

export function programmerEnvoi() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENEMENT_STATUT))
}
