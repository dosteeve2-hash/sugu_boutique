export const ENTITES = ['produits', 'clients', 'fournisseurs', 'ventes', 'achats', 'paiements'] as const
export type Entite = (typeof ENTITES)[number]
export type EntiteSync = Entite | 'boutiques'

export type Paiement = {
  id: number
  clientId: number
  montant: number
  mode: 'Espèces' | 'Orange Money' | 'Wave' | 'Moov Money'
  date: string
}

export type OpType = 'upsert' | 'delete'

export type Op = {
  opId: string
  entite: EntiteSync
  boutiqueId: string
  id: string
  type: OpType
  data?: unknown
  at: string
}

export type ResultatOp = {
  opId: string
  statut: 'applique' | 'ignore' | 'refuse' | 'invalide'
}

export type EnregistrementTire = {
  entite: EntiteSync
  boutiqueId: string
  id: string
  supprime: boolean
  data?: unknown
}

export type ReponseTirer = {
  heureServeur: string
  enregistrements: EnregistrementTire[]
}

export type StatutSauvegarde = 'sans-compte' | 'a-faire' | 'a-jour' | 'en-attente' | 'hors-ligne' | 'session-expiree'

export const TAILLE_LOT = 100
