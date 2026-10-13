import type { Client, ModePaiement, Produit, Vente, VenteLigne } from '@/lib/types'

export type ResumeBenefice = {
  chiffreAffaires: number
  benefice: number
  margePct: number | null
  lignesIgnorees: number
}

export type DepassementStock = {
  produitId: number
  nom: string
  demande: number
  disponible: number
}

export function prixAchatConnu(ligne: VenteLigne, produits: Produit[]): number | null {
  if (typeof ligne.prixAchat === 'number' && ligne.prixAchat > 0) return ligne.prixAchat
  const produit = produits.find((p) => p.id === ligne.produitId)
  return produit && produit.prixAchat > 0 ? produit.prixAchat : null
}

export function calculerBenefice(ventes: Vente[], produits: Produit[]): ResumeBenefice {
  let chiffreAffaires = 0
  let benefice = 0
  let lignesIgnorees = 0
  for (const vente of ventes) {
    for (const ligne of vente.lignes) {
      const achat = prixAchatConnu(ligne, produits)
      if (achat === null) {
        lignesIgnorees += 1
        continue
      }
      chiffreAffaires += ligne.quantite * ligne.prixUnit
      benefice += ligne.quantite * (ligne.prixUnit - achat)
    }
  }
  const margePct = chiffreAffaires > 0 ? Math.round((benefice / chiffreAffaires) * 100) : null
  return { chiffreAffaires, benefice, margePct, lignesIgnorees }
}

export function detecterDepassementStock(lignes: VenteLigne[], produits: Produit[]): DepassementStock[] {
  const depassements: DepassementStock[] = []
  for (const ligne of lignes) {
    const produit = produits.find((p) => p.id === ligne.produitId)
    if (produit && ligne.quantite > produit.stock) {
      depassements.push({
        produitId: produit.id,
        nom: produit.nom,
        demande: ligne.quantite,
        disponible: produit.stock,
      })
    }
  }
  return depassements
}

export function creditAutorise(mode: ModePaiement, clientId: number | null): boolean {
  return mode !== 'Crédit' || clientId !== null
}

export function appliquerVenteAuStock(produits: Produit[], lignes: VenteLigne[]): Produit[] {
  return produits.map((p) => {
    const ligne = lignes.find((l) => l.produitId === p.id)
    return ligne ? { ...p, stock: Math.max(0, p.stock - ligne.quantite) } : p
  })
}

export function produitsEnAlerte(produits: Produit[]): { ruptures: Produit[]; faibles: Produit[] } {
  const ruptures = produits.filter((p) => p.stock <= 0)
  const faibles = produits.filter((p) => p.stock > 0 && p.stock < p.stockMin)
  return { ruptures, faibles }
}

export function clientParId(clients: Client[], id: number | null): Client | null {
  return id === null ? null : clients.find((c) => c.id === id) ?? null
}
