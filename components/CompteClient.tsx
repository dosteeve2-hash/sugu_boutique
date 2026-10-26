'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import { useBoutique } from '@/components/BoutiqueProvider'
import { useSauvegarde } from '@/components/SyncProvider'
import { aDonneesLocales } from '@/lib/sync/session'
import { connexionSchema, emailSchema, inscriptionSchema } from '@/lib/sync/schemas'
import { boutonOrStyle, champStyle, CompteCadre, Erreur } from '@/components/CompteCadre'

type Mode = 'inscription' | 'connexion' | 'oubli'
type Issue = { path: PropertyKey[]; message: string }
type Analyse<T> = { success: true; data: T } | { success: false; error: { issues: Issue[] } }

function messageServeur(code: string | undefined, statut: number | undefined, mode: Mode): string {
  if (statut === 429) return 'Trop d’essais. Attendez une minute puis réessayez.'
  if (code === 'USER_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL')
    return 'Cette adresse e-mail a déjà un compte. Choisissez « Se connecter ».'
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || (mode === 'connexion' && statut === 401)) return 'E-mail ou mot de passe incorrect.'
  return 'Impossible pour le moment. Vérifiez votre réseau et réessayez.'
}

export default function CompteClient({ courrielActif }: { courrielActif: boolean }) {
  const router = useRouter()
  const { loaded, boutiques, ajouterBoutique } = useBoutique()
  const { connecte, email: emailActif, activerCompte, deconnecter } = useSauvegarde()
  const [mode, setMode] = useState<Mode>('inscription')
  const [nomBoutique, setNomBoutique] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const erreurChamp = (k: string) => erreurs[k] ?? null

  const valider = <T,>(parse: Analyse<T>): T | null => {
    if (parse.success) {
      setErreurs({})
      return parse.data
    }
    const e: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const k = String(issue.path[0] ?? 'global')
      if (!e[k]) e[k] = issue.message
    }
    setErreurs(e)
    return null
  }

  const soumettre = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (occupe || !loaded) return
    setErreurGlobale(null)
    setOccupe(true)
    try {
      if (mode === 'inscription') {
        const d = valider(inscriptionSchema.safeParse({ nomBoutique, email, motDePasse }))
        if (!d) return
        const dejaDesDonnees = aDonneesLocales(window.localStorage)
        const { data, error } = await authClient.signUp.email({ email: d.email, password: d.motDePasse, name: d.nomBoutique })
        if (error || !data) {
          setErreurGlobale(messageServeur(error?.code, error?.status, mode))
          return
        }
        activerCompte(data.user.id, d.email, dejaDesDonnees)
        if (!dejaDesDonnees && boutiques.length === 0) {
          ajouterBoutique({ nom: d.nomBoutique, type: 'Autre', emoji: '🏪', couleur: '#E3A00F' })
        }
        toast.success(dejaDesDonnees ? 'Compte créé.' : 'Compte créé. Vos données sont sauvegardées en ligne.')
        router.push('/app')
      } else if (mode === 'connexion') {
        const d = valider(connexionSchema.safeParse({ email, motDePasse }))
        if (!d) return
        const dejaDesDonnees = aDonneesLocales(window.localStorage)
        const { data, error } = await authClient.signIn.email({ email: d.email, password: d.motDePasse })
        if (error || !data) {
          setErreurGlobale(messageServeur(error?.code, error?.status, mode))
          return
        }
        activerCompte(data.user.id, d.email, dejaDesDonnees)
        toast.success('Connecté. Vos données reviennent sur ce téléphone.')
        router.push('/app')
      } else {
        const d = valider(emailSchema.safeParse({ email }))
        if (!d) return
        const { error } = await authClient.requestPasswordReset({ email: d.email, redirectTo: '/compte/reinitialiser' })
        if (error && error.status === 429) {
          setErreurGlobale(messageServeur(error.code, error.status, mode))
          return
        }
        setEnvoye(true)
      }
    } catch {
      setErreurGlobale('Impossible pour le moment. Vérifiez votre réseau et réessayez.')
    } finally {
      setOccupe(false)
    }
  }

  if (connecte) {
    return (
      <CompteCadre titre="Mon compte" sousTitre={emailActif ? `Connecté : ${emailActif}` : 'Vous êtes connecté.'}>
        <div style={{ background: '#263F30', border: '1px solid #496653', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <p style={{ color: '#F2EBCF', margin: 0, lineHeight: 1.5 }}>
            Vos données sont sauvegardées en ligne. Vous pouvez les retrouver sur un autre téléphone avec votre e-mail.
          </p>
          <button onClick={() => router.push('/app')} style={boutonOrStyle}>
            Retour à ma caisse
          </button>
          <button
            onClick={() => void deconnecter()}
            style={{ minHeight: 52, borderRadius: 12, border: '1px solid #5B755F', background: 'transparent', color: '#D9DEC9', fontWeight: 700, cursor: 'pointer' }}
          >
            Me déconnecter (vide ce téléphone)
          </button>
        </div>
      </CompteCadre>
    )
  }

  const titres: Record<Mode, string> = {
    inscription: 'Créer mon compte',
    connexion: 'Me connecter',
    oubli: 'Mot de passe oublié',
  }
  const sousTitres: Record<Mode, string> = {
    inscription: 'Gratuit. Vos ventes et votre stock seront sauvegardés, même si vous perdez votre téléphone.',
    connexion: 'Retrouvez votre boutique sur ce téléphone.',
    oubli: courrielActif ? 'Nous vous envoyons un lien pour choisir un nouveau mot de passe.' : '',
  }

  return (
    <CompteCadre titre={titres[mode]} sousTitre={sousTitres[mode] || undefined}>
      {mode !== 'oubli' && (
        <div role="tablist" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {(['inscription', 'connexion'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m)
                setErreurs({})
                setErreurGlobale(null)
              }}
              style={{
                flex: 1,
                minHeight: 52,
                borderRadius: 12,
                fontWeight: 800,
                cursor: 'pointer',
                border: mode === m ? '2px solid #E3A00F' : '1px solid #5B755F',
                background: mode === m ? 'rgba(227,160,15,0.1)' : 'transparent',
                color: mode === m ? '#E3A00F' : '#D9DEC9',
              }}
            >
              {m === 'inscription' ? 'Créer un compte' : 'Se connecter'}
            </button>
          ))}
        </div>
      )}

      {mode === 'oubli' && !courrielActif ? (
        <div style={{ background: '#263F30', border: '1px solid #E3A00F66', borderRadius: 14, padding: '1.25rem' }}>
          <p style={{ color: '#F2EBCF', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
            L’envoi automatique de l’e-mail de récupération n’est pas encore activé.
          </p>
          <p style={{ color: '#D9DEC9', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Écrivez-nous à <a href="mailto:docompaore2@gmail.com" style={{ color: '#E3A00F' }}>docompaore2@gmail.com</a> avec l’adresse de votre compte :
            nous remettons votre accès à zéro, vos données sont conservées.
          </p>
          <button onClick={() => setMode('connexion')} style={{ ...boutonOrStyle, minHeight: 52 }}>
            Retour
          </button>
        </div>
      ) : mode === 'oubli' && envoye ? (
        <div style={{ background: '#263F30', border: '1px solid #91D9A366', borderRadius: 14, padding: '1.25rem' }}>
          <p style={{ color: '#F2EBCF', lineHeight: 1.55, margin: '0 0 1rem' }}>
            Si cette adresse a un compte, un e-mail vient d’être envoyé. Ouvrez le lien (valable 1 heure).
          </p>
          <button
            onClick={() => {
              setMode('connexion')
              setEnvoye(false)
            }}
            style={{ ...boutonOrStyle, minHeight: 52 }}
          >
            Retour à la connexion
          </button>
        </div>
      ) : (
        <form onSubmit={soumettre} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'inscription' && (
            <div>
              <label htmlFor="c-boutique" style={{ display: 'block', color: '#D9DEC9', fontWeight: 700, marginBottom: '0.4rem' }}>
                Nom de votre boutique
              </label>
              <input
                id="c-boutique"
                value={nomBoutique}
                onChange={(e) => setNomBoutique(e.target.value)}
                autoComplete="organization"
                placeholder="Ex : Boutique Aminata"
                style={champStyle}
              />
              <Erreur message={erreurChamp('nomBoutique')} />
            </div>
          )}
          <div>
            <label htmlFor="c-email" style={{ display: 'block', color: '#D9DEC9', fontWeight: 700, marginBottom: '0.4rem' }}>
              Adresse e-mail
            </label>
            <input
              id="c-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="vous@exemple.com"
              style={champStyle}
            />
            <Erreur message={erreurChamp('email')} />
          </div>
          {mode !== 'oubli' && (
            <div>
              <label htmlFor="c-mdp" style={{ display: 'block', color: '#D9DEC9', fontWeight: 700, marginBottom: '0.4rem' }}>
                Mot de passe
              </label>
              <input
                id="c-mdp"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete={mode === 'inscription' ? 'new-password' : 'current-password'}
                placeholder={mode === 'inscription' ? 'Au moins 8 caractères' : ''}
                style={champStyle}
              />
              <Erreur message={erreurChamp('motDePasse')} />
            </div>
          )}
          <Erreur message={erreurGlobale} />
          <button type="submit" disabled={occupe || !loaded} style={{ ...boutonOrStyle, opacity: occupe ? 0.7 : 1, cursor: occupe ? 'wait' : 'pointer' }}>
            {occupe ? 'Un instant…' : mode === 'inscription' ? 'Créer mon compte' : mode === 'connexion' ? 'Me connecter' : 'Envoyer le lien'}
          </button>
          {mode === 'connexion' && (
            <button
              type="button"
              onClick={() => {
                setMode('oubli')
                setErreurs({})
                setErreurGlobale(null)
              }}
              style={{ background: 'transparent', border: 'none', color: '#E3A00F', minHeight: 48, fontWeight: 700, cursor: 'pointer' }}
            >
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'oubli' && (
            <button
              type="button"
              onClick={() => setMode('connexion')}
              style={{ background: 'transparent', border: 'none', color: '#D9DEC9', minHeight: 48, fontWeight: 700, cursor: 'pointer' }}
            >
              Retour
            </button>
          )}
        </form>
      )}
    </CompteCadre>
  )
}
