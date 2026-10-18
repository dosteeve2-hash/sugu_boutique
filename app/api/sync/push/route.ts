import { NextResponse } from 'next/server'
import { obtenirPool } from '@/lib/server/db'
import { utilisateurDepuis } from '@/lib/server/session'
import { traiterPush } from '@/lib/server/sync-route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const utilisateur = await utilisateurDepuis(req.headers)
  const texte = await req.text()
  try {
    const r = await traiterPush(obtenirPool(), utilisateur?.id ?? null, texte)
    return NextResponse.json(r.corps, { status: r.statut, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ erreur: 'serveur' }, { status: 500 })
  }
}
