'use client'

import { useEffect } from 'react'
import { NAV_TOUS } from '@/lib/nav'

export const SW_VERSION = 'sugu-sw-v1'
const CLE_PRECACHE = 'sugucloud_sw_precache'

export default function EnregistrementSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    let annule = false
    const demarrer = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        const pret = await navigator.serviceWorker.ready
        if (annule) return
        let fait = false
        try {
          fait = window.localStorage.getItem(CLE_PRECACHE) === SW_VERSION
        } catch {
          fait = false
        }
        const actif = pret.active ?? reg.active
        if (fait || !actif || !navigator.onLine) return
        const ressources = performance.getEntriesByType('resource').map((r) => r.name)
        const urls = [...new Set(['/', '/compte', ...NAV_TOUS.map((n) => n.href), ...ressources])]
        actif.postMessage({ type: 'PRECACHE', urls })
        try {
          window.localStorage.setItem(CLE_PRECACHE, SW_VERSION)
        } catch {
          // sans mémoire locale on rechargera au prochain démarrage
        }
      } catch {
        // le service worker est un bonus : l'application marche sans
      }
    }
    void demarrer()
    return () => {
      annule = true
    }
  }, [])
  return null
}
