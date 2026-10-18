import { z } from 'zod'
import { ENTITES } from '@/lib/sync/types'

const entier = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)
const texte = (max: number) => z.string().max(max)
const date = z.string().max(40)

export const boutiqueSchema = z.object({
  id: texte(80).min(1),
  nom: texte(80).min(1),
  type: z.enum(['Alimentation', 'Vêtements', 'Électronique', 'Restaurant', 'Autre']),
  emoji: texte(16),
  couleur: texte(16),
  dateCreation: date,
})

export const produitSchema = z.object({
  id: entier,
  nom: texte(120).min(1),
  categorie: texte(120),
  prixAchat: entier,
  prixVente: entier,
  stock: entier,
  stockMin: entier,
  unite: texte(40).optional(),
})

export const clientSchema = z.object({
  id: entier,
  nom: texte(120).min(1),
  telephone: texte(40),
  ville: texte(80),
  soldeDu: entier,
  totalAchats: entier,
  derniereVisite: date,
})

export const fournisseurSchema = z.object({
  id: entier,
  nom: texte(120).min(1),
  contact: texte(120),
  ville: texte(80),
  produits: texte(400),
  totalAchats: entier,
  derniereCommande: date,
})

const modeSchema = z.enum(['Espèces', 'Orange Money', 'Wave', 'Moov Money', 'Crédit'])

export const venteSchema = z
  .object({
    id: entier,
    clientId: entier.nullable(),
    client: texte(120),
    lignes: z
      .array(
        z.object({
          produitId: entier,
          nom: texte(120),
          quantite: entier.min(1),
          prixUnit: entier,
          prixAchat: entier.optional(),
        })
      )
      .max(200),
    total: entier,
    modePaiement: modeSchema,
    statut: z.enum(['Payé', 'Crédit']),
    date,
    satisfaction: z.enum(['bien', 'correct', 'probleme']).nullable().optional(),
  })
  .refine((v) => v.statut !== 'Crédit' || v.clientId !== null, {
    message: 'Une vente à crédit doit avoir un client',
    path: ['clientId'],
  })

export const achatSchema = z.object({
  id: entier,
  fournisseurId: entier.nullable(),
  fournisseur: texte(120),
  produitId: entier.nullable(),
  produit: texte(120),
  quantite: entier,
  prixUnit: entier,
  total: entier,
  statut: z.enum(['Livré', 'En attente']),
  date,
})

export const paiementSchema = z.object({
  id: entier,
  clientId: entier,
  montant: entier.min(1),
  mode: z.enum(['Espèces', 'Orange Money', 'Wave', 'Moov Money']),
  date,
})

export const SCHEMAS_ENTITES = {
  boutiques: boutiqueSchema,
  produits: produitSchema,
  clients: clientSchema,
  fournisseurs: fournisseurSchema,
  ventes: venteSchema,
  achats: achatSchema,
  paiements: paiementSchema,
} as const

export const opSchema = z.object({
  opId: z.string().min(8).max(64),
  entite: z.enum(['boutiques', ...ENTITES]),
  boutiqueId: z.string().min(1).max(80),
  id: z.string().regex(/^[A-Za-z0-9_]{1,80}$/),
  type: z.enum(['upsert', 'delete']),
  data: z.unknown().optional(),
  at: z.string().datetime(),
})

export const lotOpsSchema = z.object({ ops: z.array(opSchema).min(1).max(200) })

export const inscriptionSchema = z.object({
  nomBoutique: z.string().trim().min(2, 'Écrivez le nom de votre boutique').max(80),
  email: z.string().trim().toLowerCase().email('Adresse e-mail non valide').max(160),
  motDePasse: z.string().min(8, 'Au moins 8 caractères').max(128),
})

export const connexionSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail non valide').max(160),
  motDePasse: z.string().min(1, 'Entrez votre mot de passe').max(128),
})

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail non valide').max(160),
})

export const nouveauMotDePasseSchema = z.object({
  motDePasse: z.string().min(8, 'Au moins 8 caractères').max(128),
})

export const remboursementSchema = z.object({
  clientId: entier,
  montant: z.number().int().min(1, 'Entrez un montant').max(1_000_000_000),
  mode: z.enum(['Espèces', 'Orange Money', 'Wave', 'Moov Money']),
})

export const clientRapideSchema = z.object({
  nom: z.string().trim().min(2, 'Écrivez le nom du client').max(120),
  telephone: z.string().trim().max(40),
})
