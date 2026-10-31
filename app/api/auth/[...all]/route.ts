import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@/lib/server/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET(requete: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ erreur: 'Base non configurée.' }, { status: 503 })
  return toNextJsHandler(getAuth()).GET(requete)
}

export function POST(requete: Request) {
  if (!process.env.DATABASE_URL) return Response.json({ erreur: 'Base non configurée.' }, { status: 503 })
  return toNextJsHandler(getAuth()).POST(requete)
}