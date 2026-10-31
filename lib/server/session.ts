import { getAuth } from '@/lib/server/auth'

export async function utilisateurDepuis(headers: Headers): Promise<{ id: string; email: string } | null> {
  const session = await getAuth().api.getSession({ headers })
  return session ? { id: session.user.id, email: session.user.email } : null
}
