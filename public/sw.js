/* SUGU : démarrage hors ligne. Version à garder identique à SW_VERSION dans components/EnregistrementSW.tsx */
const VERSION = 'sugu-sw-v2'
const PAGES = VERSION + '-pages'
const STATIQUE = VERSION + '-static'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const noms = await caches.keys()
      await Promise.all(noms.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n)))
      await self.clients.claim()
    })()
  )
})

async function miseEnCache(nomCache, requete, reponse) {
  if (reponse && reponse.ok && reponse.type === 'basic') {
    const cache = await caches.open(nomCache)
    await cache.put(requete, reponse.clone())
  }
}

function estRSC(requete, url) {
  return requete.headers.get('RSC') === '1' || url.searchParams.has('_rsc')
}

async function pageStaleWhileRevalidate(requete) {
  const cache = await caches.open(PAGES)
  const clef = new URL(requete.url).pathname
  const enCache = await cache.match(clef)
  const reseau = fetch(requete)
    .then(async (reponse) => {
      if (reponse && reponse.ok) await cache.put(clef, reponse.clone())
      return reponse
    })
    .catch(() => null)
  if (enCache) {
    reseau.catch(() => undefined)
    return enCache
  }
  const reponse = await reseau
  if (reponse) return reponse
  return (await cache.match('/')) || new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

async function cachePremier(requete) {
  const cache = await caches.open(STATIQUE)
  const enCache = await cache.match(requete)
  if (enCache) return enCache
  const reponse = await fetch(requete)
  await miseEnCache(STATIQUE, requete, reponse)
  return reponse
}

async function staleWhileRevalidate(requete) {
  const cache = await caches.open(STATIQUE)
  const enCache = await cache.match(requete)
  const reseau = fetch(requete)
    .then(async (reponse) => {
      await miseEnCache(STATIQUE, requete, reponse)
      return reponse
    })
    .catch(() => null)
  if (enCache) return enCache
  return (await reseau) || Response.error()
}

async function reseauPuisCache(requete) {
  try {
    const reponse = await fetch(requete)
    await miseEnCache(PAGES, requete, reponse)
    return reponse
  } catch (e) {
    const cache = await caches.open(PAGES)
    const enCache = await cache.match(requete)
    if (enCache) return enCache
    throw e
  }
}

self.addEventListener('fetch', (event) => {
  const requete = event.request
  if (requete.method !== 'GET') return
  const url = new URL(requete.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return

  if (requete.mode === 'navigate') {
    event.respondWith(pageStaleWhileRevalidate(requete))
    return
  }
  if (estRSC(requete, url)) {
    event.respondWith(reseauPuisCache(requete))
    return
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cachePremier(requete))
    return
  }
  event.respondWith(staleWhileRevalidate(requete))
})

async function precacher(urls) {
  const pages = await caches.open(PAGES)
  const statique = await caches.open(STATIQUE)
  const motif = /\/_next\/static\/[^"'\\s)]+/g
  for (const brut of urls) {
    try {
      const url = new URL(brut, self.location.origin)
      if (url.origin !== self.location.origin) continue
      if (url.pathname.startsWith('/_next/static/') || /\.(png|svg|ico|webmanifest|woff2?|jpg|webp)$/.test(url.pathname)) {
        if (!(await statique.match(url.pathname + url.search))) {
          const r = await fetch(url.href)
          if (r.ok) await statique.put(url.pathname + url.search, r)
        }
        continue
      }
      const reponse = await fetch(url.href, { headers: { Accept: 'text/html' } })
      if (!reponse.ok) continue
      const texte = await reponse.clone().text()
      await pages.put(url.pathname, reponse)
      const assets = new Set(texte.match(motif) || [])
      for (const a of assets) {
        if (!(await statique.match(a))) {
          try {
            const r = await fetch(a)
            if (r.ok) await statique.put(a, r)
          } catch (e) {
            /* un asset manquant ne bloque pas le reste */
          }
        }
      }
    } catch (e) {
      /* hors ligne pendant le préchargement : on réessaiera au prochain démarrage */
    }
  }
}

self.addEventListener('message', (event) => {
  const donnees = event.data
  if (donnees && donnees.type === 'PRECACHE' && Array.isArray(donnees.urls)) {
    event.waitUntil(precacher(donnees.urls.filter((u) => typeof u === 'string')))
  }
})
