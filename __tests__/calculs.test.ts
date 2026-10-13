import { describe, it, expect } from 'vitest'
import {
  calculerBenefice,
  creditAutorise,
  detecterDepassementStock,
  appliquerVenteAuStock,
  produitsEnAlerte,
} from '@/lib/calculs'
import type { Produit, Vente } from '@/lib/types'

const sucre: Produit = { id: 1, nom: 'Sucre', categorie: 'Alimentaire', prixAchat: 600, prixVente: 800, stock: 2, stockMin: 5 }

const venteSucre = (quantite: number, prixAchat?: number): Vente => ({
  id: 1,
  clientId: null,
  client: 'Client de passage',
  lignes: [{ produitId: 1, nom: 'Sucre', quantite, prixUnit: 800, prixAchat }],
  total: quantite * 800,
  modePaiement: 'Espèces',
  statut: 'Payé',
  date: '2026-10-13',
})

describe('calculerBenefice', () => {
  it('3 sucres vendus 800 achetés 600 = 600 de bénéfice, marge 25 %', () => {
    const r = calculerBenefice([venteSucre(3, 600)], [sucre])
    expect(r.chiffreAffaires).toBe(2400)
    expect(r.benefice).toBe(600)
    expect(r.margePct).toBe(25)
  })

  it('n affiche jamais 100 % de marge quand le prix d achat est connu', () => {
    expect(calculerBenefice([venteSucre(3, 600)], [sucre]).margePct).not.toBe(100)
  })

  it('retombe sur le prix d achat actuel du produit pour les anciennes ventes', () => {
    const r = calculerBenefice([venteSucre(3)], [sucre])
    expect(r.benefice).toBe(600)
  })

  it('ignore les lignes sans prix d achat connu et le signale', () => {
    const sansAchat: Produit = { ...sucre, prixAchat: 0 }
    const r = calculerBenefice([venteSucre(3)], [sansAchat])
    expect(r.lignesIgnorees).toBe(1)
    expect(r.margePct).toBeNull()
    expect(r.benefice).toBe(0)
  })

  it('aucune vente donne une marge nulle', () => {
    expect(calculerBenefice([], [sucre]).margePct).toBeNull()
  })

  it('une vente à perte donne un bénéfice négatif', () => {
    const r = calculerBenefice([venteSucre(1, 900)], [sucre])
    expect(r.benefice).toBe(-100)
  })
})

describe('detecterDepassementStock', () => {
  it('signale 3 sucres demandés pour 2 en stock', () => {
    const r = detecterDepassementStock([{ produitId: 1, nom: 'Sucre', quantite: 3, prixUnit: 800 }], [sucre])
    expect(r).toEqual([{ produitId: 1, nom: 'Sucre', demande: 3, disponible: 2 }])
  })

  it('ne signale rien quand le stock suffit', () => {
    expect(detecterDepassementStock([{ produitId: 1, nom: 'Sucre', quantite: 2, prixUnit: 800 }], [sucre])).toEqual([])
  })
})

describe('creditAutorise', () => {
  it('refuse le crédit sans client rattaché', () => {
    expect(creditAutorise('Crédit', null)).toBe(false)
  })
  it('accepte le crédit avec un client', () => {
    expect(creditAutorise('Crédit', 7)).toBe(true)
  })
  it('accepte les espèces sans client', () => {
    expect(creditAutorise('Espèces', null)).toBe(true)
  })
})

describe('stock après vente et alertes', () => {
  it('le stock baisse de la quantité vendue sans devenir négatif', () => {
    const r = appliquerVenteAuStock([sucre], [{ produitId: 1, nom: 'Sucre', quantite: 3, prixUnit: 800 }])
    expect(r[0].stock).toBe(0)
  })

  it('sépare ruptures et stocks faibles', () => {
    const a = produitsEnAlerte([{ ...sucre, stock: 0 }, { ...sucre, id: 2, stock: 3 }, { ...sucre, id: 3, stock: 9 }])
    expect(a.ruptures.map((p) => p.id)).toEqual([1])
    expect(a.faibles.map((p) => p.id)).toEqual([2])
  })
})
