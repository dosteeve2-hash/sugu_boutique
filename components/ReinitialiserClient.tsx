'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { nouveauMotDePasseSchema } from '@/lib/sync/schemas'
import { boutonOrStyle, champStyle, CompteCadre, Erreur } from '@/components/CompteCadre'

export default function ReinitialiserClient() {
  const params = useSearchParams()
  const token = params.get('token')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [fini, setFini] = useState(false)
  const [occupe, setOccupe] = useState(false)

  const soumettre = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!token) return
    const parse = nouveauMotDePasseSchema.safeParse({ motDePasse })
    if (!parse.success) {
      setErreur(parse.error.issues[0]?.message ?? 'Mot de passe non valide')
      return
    }
    setOccupe(true)
    setErreur(null)
    try {
      const { error } = await authClient.resetPassword({ newPassword: parse.data.motDePasse, token })
      if (error) setErreur('Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.')
      else setFini(true)
    } catch {
      setErreur('Impossible pour le moment. Vérifiez votre réseau.')
    } finally {
      setOccupe(false)
    }
  }

  return (
    <CompteCadre titre="Nouveau mot de passe">
      {!token ? (
        <p style={{ color: '#ef4444', textAlign: 'center' }}>Lien non valide. Demandez-en un nouveau depuis « Mot de passe oublié ».</p>
      ) : fini ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#91D9A3', fontWeight: 700 }}>Mot de passe changé.</p>
          <Link href="/compte" style={{ ...boutonOrStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            Me connecter
          </Link>
        </div>
      ) : (
        <form onSubmit={soumettre} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="r-mdp" style={{ display: 'block', color: '#D9DEC9', fontWeight: 700, marginBottom: '0.4rem' }}>
              Nouveau mot de passe
            </label>
            <input
              id="r-mdp"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              autoComplete="new-password"
              placeholder="Au moins 8 caractères"
              style={champStyle}
            />
            <Erreur message={erreur} />
          </div>
          <button type="submit" disabled={occupe} style={boutonOrStyle}>
            {occupe ? 'Un instant…' : 'Enregistrer'}
          </button>
        </form>
      )}
    </CompteCadre>
  )
}
