'use client'

import { useCallback, useEffect, useState } from 'react'
import { useBoutique } from '@/components/BoutiqueProvider'

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key)
      setValue(saved ? JSON.parse(saved) : initial)
    } catch {
      setValue(initial)
    }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // storage full or unavailable — data stays in memory for this session
        }
        return next
      })
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
