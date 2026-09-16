'use client'

import { useEffect, useState } from 'react'

/**
 * Couche d'écriture de SUGU.
 *
 * Toutes les données de la boutique — ventes, produits, stock, clients,
 * crédits — vivent dans `localStorage` : l'application n'a pas de serveur, ce
 * qui est ce qui lui permet de fonctionner sans réseau. La contrepartie est
 * que `localStorage` peut refuser une écriture, et qu'un refus silencieux
 * signifie une vente encaissée que le commerçant ne retrouvera pas demain.
 *
 * Ce module rend ce refus visible : `ecrireLocal` dit si l'écriture a réussi,
 * et les échecs sont diffusés pour qu'une bannière les annonce.
 */

export type RaisonEchec = 'quota' | 'indisponible'

export interface EchecEcriture {
  cle: string
  raison: RaisonEchec
}

/** Un sous-ensemble de `Storage` : de quoi injecter un faux dans les tests. */
export interface StockageMinimal {
  setItem(cle: string, valeur: string): void
}

/**
 * `QuotaExceededError` porte le code 22 dans les navigateurs historiques et
 * 1014 dans Firefox ; certains mobiles ne renseignent que le `name`. On teste
 * les trois plutôt que de se fier à un seul.
 */
function estQuotaDepasse(erreur: unknown): boolean {
  if (!(erreur instanceof Error)) return false
  const code = (erreur as DOMException).code
  return (
    erreur.name === 'QuotaExceededError' ||
    erreur.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014
  )
}

/**
 * Écrit une valeur et retourne l'échec s'il y en a un, `null` sinon.
 *
 * Le stockage est injectable pour que le cas « quota dépassé » soit testable :
 * on ne peut pas remplir `localStorage` dans un test de façon fiable.
 */
export function ecrireLocal(
  cle: string,
  valeur: unknown,
  stockage?: StockageMinimal | null,
): EchecEcriture | null {
  const cible =
    stockage ?? (typeof window === 'undefined' ? null : window.localStorage)

  if (!cible) return { cle, raison: 'indisponible' }

  try {
    cible.setItem(cle, JSON.stringify(valeur))
    return null
  } catch (erreur) {
    return { cle, raison: estQuotaDepasse(erreur) ? 'quota' : 'indisponible' }
  }
}

// --- Diffusion des échecs -------------------------------------------------
//
// Un simple registre plutôt qu'un contexte React : `usePersisted` est appelé
// par quatorze pages, et aucune d'elles n'a à connaître ce mécanisme. La
// bannière s'abonne une seule fois, dans AppShell.

let echecs: EchecEcriture[] = []
const abonnes = new Set<(e: EchecEcriture[]) => void>()

function diffuser() {
  const instantane = echecs
  abonnes.forEach((abonne) => abonne(instantane))
}

export function signalerEchec(echec: EchecEcriture): void {
  // Une même clé qui échoue en boucle ne doit pas empiler cent bannières.
  if (echecs.some((e) => e.cle === echec.cle && e.raison === echec.raison)) return
  echecs = [...echecs, echec]
  diffuser()
}

export function oublierEchecs(): void {
  echecs = []
  diffuser()
}

/** Les échecs d'écriture en cours. Vide tant que tout va bien. */
export function useEchecsStockage(): EchecEcriture[] {
  const [liste, setListe] = useState<EchecEcriture[]>(echecs)

  useEffect(() => {
    abonnes.add(setListe)
    setListe(echecs)
    return () => {
      abonnes.delete(setListe)
    }
  }, [])

  return liste
}
