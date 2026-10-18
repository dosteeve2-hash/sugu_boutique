import { NextResponse } from 'next/server'
import { obtenirPool } from '@/lib/server/db'
import { utilisateurDepuis } from '@/lib/server/session'
import { traiterPull } from '@/lib/server/sync-route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const utilisateur = await utilisateurDepuis(req.headers)
  const depuis = new URL(req.url).searchParams.get('depuis')
  try {
    const r = await traiterPull(obtenirPool(), utilisateur?.id ?? null, depuis)
    return NextResponse.json(r.corps, { status: r.statut, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ erreur: 'serveur' }, { status: 500 })
  }
}
