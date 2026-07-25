'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Langue, traductions, Traduction } from '@/lib/i18n'

type LangueContextValue = {
  langue: Langue
  setLangue: (l: Langue) => void
  t: Traduction
}

const LangueContext = createContext<LangueContextValue | null>(null)

const STORAGE_KEY = 'sugu_langue'

export function LangueProvider({ children }: { children: React.ReactNode }) {
  const [langue, setLangueState] = useState<Langue>('fr')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Langue | null
    if (saved && saved in traductions) setLangueState(saved)
  }, [])

  const setLangue = (l: Langue) => {
    setLangueState(l)
    window.localStorage.setItem(STORAGE_KEY, l)
  }

  return (
    <LangueContext.Provider value={{ langue, setLangue, t: traductions[langue] }}>
      {children}
    </LangueContext.Provider>
  )
}

export function useLangue() {
  const ctx = useContext(LangueContext)
  if (!ctx) throw new Error('useLangue doit être utilisé à l\'intérieur de LangueProvider')
  return ctx
}
