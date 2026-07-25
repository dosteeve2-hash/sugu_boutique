'use client'

import { useCallback, useEffect, useState } from 'react'

export function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved) setValue(JSON.parse(saved))
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true)
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
