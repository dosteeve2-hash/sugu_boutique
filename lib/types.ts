export type TypeBoutique = 'Alimentation' | 'Vêtements' | 'Électronique' | 'Restaurant' | 'Autre'

export type Boutique = {
  id: string
  nom: string
  type: TypeBoutique
  emoji: string
  couleur: string
  dateCreation: string
}

export type Produit = {
  id: number
  nom: string
  categorie: string
  prixAchat: number
  prixVente: number
  stock: number
  stockMin: number
  unite?: string
}

export type Client = {
  id: number
  nom: string
  telephone: string
  ville: string
  soldeDu: number
  totalAchats: number
  derniereVisite: string
}

export type Fournisseur = {
  id: number
  nom: string
  contact: string
  ville: string
  produits: string
  totalAchats: number
  derniereCommande: string
}

export type ModePaiement = 'Espèces' | 'Orange Money' | 'Wave' | 'Moov Money' | 'Crédit'

export type VenteLigne = {
  produitId: number
  nom: string
  quantite: number
  prixUnit: number
  prixAchat?: number
}

export type Satisfaction = 'bien' | 'correct' | 'probleme'

export type Vente = {
  id: number
  clientId: number | null
  client: string
  lignes: VenteLigne[]
  total: number
  modePaiement: ModePaiement
  statut: 'Payé' | 'Crédit'
  date: string
  satisfaction?: Satisfaction | null
}

export type Achat = {
  id: number
  fournisseurId: number | null
  fournisseur: string
  produitId: number | null
  produit: string
  quantite: number
  prixUnit: number
  total: number
  statut: 'Livré' | 'En attente'
  date: string
}
