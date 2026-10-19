import type { Client, Vente } from '@/lib/types'
import type { Paiement } from '@/lib/sync/types'

export type ModeRemboursement = Paiement['mode']

export const MODES_REMBOURSEMENT: ModeRemboursement[] = ['Espèces', 'Orange Money', 'Wave', 'Moov Money']

/** Une vente à crédit augmente le solde dû du client (et son total d'achats). */
export function appliquerVenteAuClient(clients: Client[], clientId: number, vente: Pick<Vente, 'total' | 'statut' | 'date'>): Client[] {
  return clients.map((c) =>
    c.id === clientId
      ? {
          ...c,
          totalAchats: c.totalAchats + vente.total,
          derniereVisite: vente.date,
          soldeDu: c.soldeDu + (vente.statut === 'Crédit' ? vente.total : 0),
        }
      : c
  )
}

export type ResultatRemboursement =
  | { ok: true; clients: Client[]; paiement: Paiement }
  | { ok: false; erreur: string }

export function enregistrerRemboursement(
  clients: Client[],
  demande: { clientId: number; montant: number; mode: ModeRemboursement },
  maintenant: Date = new Date()
): ResultatRemboursement {
  const client = clients.find((c) => c.id === demande.clientId)
  if (!client) return { ok: false, erreur: 'Client introuvable.' }
  if (!Number.isInteger(demande.montant) || demande.montant <= 0) return { ok: false, erreur: 'Entrez un montant.' }
  if (demande.montant > client.soldeDu) {
    return { ok: false, erreur: `Ce client ne doit que ${client.soldeDu.toLocaleString('fr-FR')} FCFA.` }
  }
  const paiement: Paiement = {
    id: maintenant.getTime(),
    clientId: client.id,
    montant: demande.montant,
    mode: demande.mode,
    date: maintenant.toISOString().slice(0, 10),
  }
  return {
    ok: true,
    paiement,
    clients: clients.map((c) => (c.id === client.id ? { ...c, soldeDu: c.soldeDu - demande.montant } : c)),
  }
}

/** Solde recalculé depuis l'historique : ventes à crédit moins remboursements. Sert de contrôle de cohérence. */
export function soldeDepuisHistorique(ventes: Vente[], paiements: Paiement[], clientId: number): number {
  const du = ventes.filter((v) => v.clientId === clientId && v.statut === 'Crédit').reduce((a, v) => a + v.total, 0)
  const rembourse = paiements.filter((p) => p.clientId === clientId).reduce((a, p) => a + p.montant, 0)
  return Math.max(0, du - rembourse)
}
