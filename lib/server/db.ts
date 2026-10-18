import { Pool } from 'pg'

const globale = globalThis as unknown as { suguPool?: Pool }

export function obtenirPool(): Pool {
  if (!globale.suguPool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL manquante')
    globale.suguPool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000 })
  }
  return globale.suguPool
}
