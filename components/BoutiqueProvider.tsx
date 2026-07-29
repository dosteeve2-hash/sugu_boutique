'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Boutique, TypeBoutique } from '@/lib/types'

export const TYPES_BOUTIQUE: { type: TypeBoutique; emoji: string }[] = [
  { type: 'Alimentation', emoji: '🛒' },
  { type: 'Vêtements', emoji: '👗' },
  { type: 'Électronique', emoji: '📱' },
  { type: 'Restaurant', emoji: '🍗' },
  { type: 'Autre', emoji: '🏪' },
]

export const COULEURS_BOUTIQUE = ['#D4AF37', '#00BCD4', '#22d98a', '#ef4444', '#f0a832', '#a855f7']

const KEY_BOUTIQUES = 'sugu_boutiques'
const KEY_ACTIVE = 'sugu_boutique_active'
const LEGACY_KEYS = ['sugu_produits', 'sugu_ventes', 'sugu_clients', 'sugu_achats', 'sugu_fournisseurs']

type BoutiqueContextValue = {
  boutiques: Boutique[]
  boutiqueActive: Boutique | null
  loaded: boolean
  changerBoutique: (id: string) => void
  ajouterBoutique: (data: Omit<Boutique, 'id' | 'dateCreation'>) => Boutique
  modifierBoutique: (id: string, data: Partial<Omit<Boutique, 'id'>>) => void
  supprimerBoutique: (id: string) => void
}

const BoutiqueContext = createContext<BoutiqueContextValue | null>(null)

function genId() {
  return `bt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function BoutiqueProvider({ children }: { children: React.ReactNode }) {
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedBoutiques = window.localStorage.getItem(KEY_BOUTIQUES)
      const savedActive = window.localStorage.getItem(KEY_ACTIVE)
      let list: Boutique[] = savedBoutiques ? JSON.parse(savedBoutiques) : []

      const hasLegacyData = LEGACY_KEYS.some((k) => window.localStorage.getItem(k))
      if (list.length === 0 && hasLegacyData) {
        const migree: Boutique = {
          id: genId(),
          nom: 'Ma Boutique',
          type: 'Autre',
          emoji: '🏪',
          couleur: '#D4AF37',
          dateCreation: new Date().toISOString().slice(0, 10),
        }
        list = [migree]
        LEGACY_KEYS.forEach((k) => {
          const val = window.localStorage.getItem(k)
          if (val) {
            window.localStorage.setItem(`sugu_${migree.id}_${k.replace('sugu_', '')}`, val)
            window.localStorage.removeItem(k)
          }
        })
        window.localStorage.setItem(KEY_BOUTIQUES, JSON.stringify(list))
        window.localStorage.setItem(KEY_ACTIVE, migree.id)
      }

      setBoutiques(list)
      const active = savedActive && list.some((b) => b.id === savedActive) ? savedActive : list[0]?.id ?? null
      setActiveId(active)
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true)
  }, [])

  const changerBoutique = useCallback((id: string) => {
    setActiveId(id)
    try {
      window.localStorage.setItem(KEY_ACTIVE, id)
    } catch {
      // storage unavailable — kept in memory for this session
    }
  }, [])

  const ajouterBoutique = useCallback(
    (data: Omit<Boutique, 'id' | 'dateCreation'>) => {
      const nouvelle: Boutique = { ...data, id: genId(), dateCreation: new Date().toISOString().slice(0, 10) }
      setBoutiques((prev) => {
        const next = [...prev, nouvelle]
        try {
          window.localStorage.setItem(KEY_BOUTIQUES, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
      changerBoutique(nouvelle.id)
      return nouvelle
    },
    [changerBoutique]
  )

  const modifierBoutique = useCallback(
    (id: string, data: Partial<Omit<Boutique, 'id'>>) => {
      setBoutiques((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, ...data } : b))
        try {
          window.localStorage.setItem(KEY_BOUTIQUES, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    },
    []
  )

  const supprimerBoutique = useCallback(
    (id: string) => {
      setBoutiques((prev) => {
        const next = prev.filter((b) => b.id !== id)
        try {
          window.localStorage.setItem(KEY_BOUTIQUES, JSON.stringify(next))
          const keysToRemove: string[] = []
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i)
            if (k && k.startsWith(`sugu_${id}_`)) keysToRemove.push(k)
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k))
        } catch {
          // ignore
        }
        if (activeId === id) {
          const fallback = next[0]?.id ?? null
          setActiveId(fallback)
          if (fallback) window.localStorage.setItem(KEY_ACTIVE, fallback)
          else window.localStorage.removeItem(KEY_ACTIVE)
        }
        return next
      })
    },
    [activeId]
  )

  const boutiqueActive = boutiques.find((b) => b.id === activeId) ?? null

  return (
    <BoutiqueContext.Provider
      value={{ boutiques, boutiqueActive, loaded, changerBoutique, ajouterBoutique, modifierBoutique, supprimerBoutique }}
    >
      {children}
    </BoutiqueContext.Provider>
  )
}

export function useBoutique() {
  const ctx = useContext(BoutiqueContext)
  if (!ctx) throw new Error('useBoutique doit être utilisé à l\'intérieur de BoutiqueProvider')
  return ctx
}

export function cleBoutique(boutiqueId: string | undefined, entite: string) {
  return `sugu_${boutiqueId ?? 'none'}_${entite}`
}
