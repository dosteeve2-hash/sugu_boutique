'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useBoutique } from '@/components/BoutiqueProvider'
import { ecrireLocal, signalerEchec } from '@/lib/persistance'

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  // La valeur courante, tenue à jour hors du rendu : elle permet d'appliquer
  // une mise à jour fonctionnelle sans passer par l'updater de `setValue`.
  const valeurRef = useRef<T>(initial)

  useEffect(() => {
    let chargee: T
    try {
      const saved = window.localStorage.getItem(key)
      chargee = saved ? (JSON.parse(saved) as T) : initial
    } catch {
      chargee = initial
    }
    valeurRef.current = chargee
    setValue(chargee)
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const next =
        typeof updater === 'function'
          ? (updater as (p: T) => T)(valeurRef.current)
          : updater

      valeurRef.current = next
      setValue(next)

      // L'écriture a lieu ici et non dans l'updater de `setValue` : React peut
      // rejouer un updater, et un effet de bord n'a rien à y faire.
      const echec = ecrireLocal(key, next)
      if (echec) signalerEchec(echec)
    },
    [key]
  )

  return [value, update, loaded] as const
}

export function usePersistedBoutique<T>(entite: string, initial: T) {
  const { boutiqueActive, loaded: boutiqueLoaded } = useBoutique()
  const key = `sugu_${boutiqueActive?.id ?? 'none'}_${entite}`
  const [value, update, storageLoaded] = usePersisted<T>(key, initial)
  return [value, update, boutiqueLoaded && storageLoaded] as const
}
