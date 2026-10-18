import type { Pool } from 'pg'
import { appliquerLot, tirerChangements, type ClientTransaction } from '@/lib/server/sync-sql'
import { lotOpsSchema } from '@/lib/sync/schemas'
import type { Op, ResultatOp } from '@/lib/sync/types'

export const TAILLE_MAX_CORPS = 1_000_000

export type ReponseServeur = { statut: number; corps: unknown }

export async function traiterPush(pool: Pool, userId: string | null, texte: string): Promise<ReponseServeur> {
  if (!userId) return { statut: 401, corps: { erreur: 'non-connecte' } }
  if (texte.length > TAILLE_MAX_CORPS) return { statut: 413, corps: { erreur: 'trop-gros' } }
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    return { statut: 400, corps: { erreur: 'json-invalide' } }
  }
  const lot = lotOpsSchema.safeParse(brut)
  if (!lot.success) return { statut: 400, corps: { erreur: 'lot-invalide' } }
  const resultats: ResultatOp[] = await appliquerLot(
    async () => {
      const client = await pool.connect()
      return {
        query: async (text: string, values?: unknown[]) => {
          const r = await client.query(text, values)
          return { rows: r.rows as Record<string, unknown>[], rowCount: r.rowCount }
        },
        release: () => client.release(),
      } satisfies ClientTransaction
    },
    userId,
    lot.data.ops as Op[]
  )
  return { statut: 200, corps: { resultats } }
}

export async function traiterPull(pool: Pool, userId: string | null, depuis: string | null): Promise<ReponseServeur> {
  if (!userId) return { statut: 401, corps: { erreur: 'non-connecte' } }
  const date = depuis ? new Date(depuis) : new Date(0)
  if (Number.isNaN(date.getTime())) return { statut: 400, corps: { erreur: 'date-invalide' } }
  const r = await tirerChangements(
    {
      query: async (text: string, values?: unknown[]) => {
        const res = await pool.query(text, values)
        return { rows: res.rows as Record<string, unknown>[], rowCount: res.rowCount }
      },
    },
    userId,
    date.toISOString()
  )
  return { statut: 200, corps: r }
}
