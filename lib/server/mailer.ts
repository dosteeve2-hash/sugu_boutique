export type Courriel = { a: string; sujet: string; texte: string }

export function courrielConfigure(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM)
}

export async function envoyerCourriel(courriel: Courriel, appel: typeof fetch = fetch): Promise<boolean> {
  const cle = process.env.RESEND_API_KEY
  const de = process.env.MAIL_FROM
  if (!cle || !de) return false
  const reponse = await appel('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: de, to: courriel.a, subject: courriel.sujet, text: courriel.texte }),
  })
  return reponse.ok
}
