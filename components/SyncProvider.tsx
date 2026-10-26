'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CloudUpload } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/Modal'
import { authClient } from '@/lib/auth-client'
import { creerMoteur, type Moteur } from '@/lib/sync/engine'
import { enregistrerMoteur, EVENEMENT_DONNEES } from '@/lib/sync/bridge'
import { CLES, resumeDonneesLocales, type ResumeLocal } from '@/lib/sync/outbox'
import { aDonneesLocales, estMigre, marquerMigre, statutAffiche, viderDonneesLocales } from '@/lib/sync/session'
import type { StatutSauvegarde } from '@/lib/sync/types'

type SyncContextValue = {
  statut: StatutSauvegarde
  enAttente: number
  rejets: number
  email: string | null
  connecte: boolean
  synchroniser: () => Promise<void>
  activerCompte: (idUtilisateur: string, email: string, aDejaDesDonnees: boolean) => void
  deconnecter: () => Promise<boolean>
}

const SyncContext = createContext<SyncContextValue | null>(null)

const CLE_EMAIL = 'sugucloud_email'
const CLE_REPORT = 'sugucloud_migration_reportee'

function delaiRelance(echecs: number): number {
  return Math.min(60_000, 1500 * 2 ** echecs)
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const moteurRef = useRef<Moteur | null>(null)
  const [statutBrut, setStatutBrut] = useState<StatutSauvegarde>('sans-compte')
  const [enAttente, setEnAttente] = useState(0)
  const [rejets, setRejets] = useState(0)
  const [email, setEmail] = useState<string | null>(null)
  const [migre, setMigre] = useState(true)
  const [idUtilisateur, setIdUtilisateur] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeLocal | null>(null)
  const [dialogue, setDialogue] = useState(false)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null)
  const echecs = useRef(0)
  const occupe = useRef(false)
  const { data: session, isPending, error } = authClient.useSession()

  const rafraichir = useCallback(() => {
    const m = moteurRef.current
    if (!m) return
    const id = m.utilisateur()
    setStatutBrut(m.statut())
    setEnAttente(m.enAttente())
    setIdUtilisateur(id)
    setMigre(id ? estMigre(window.localStorage, id) : true)
    setRejets(Number(window.localStorage.getItem(CLES.rejets) ?? '0') || 0)
    setEmail(window.localStorage.getItem(CLE_EMAIL))
  }, [])

  const lancer = useCallback(async () => {
    const m = moteurRef.current
    if (!m || occupe.current) return
    occupe.current = true
    try {
      await m.synchroniser()
    } finally {
      occupe.current = false
      echecs.current = m.enAttente() > 0 ? echecs.current + 1 : 0
      rafraichir()
      planifier()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rafraichir])

  const planifier = useCallback(() => {
    const m = moteurRef.current
    if (!m || minuterie.current || occupe.current) return
    if (!m.utilisateur() || m.enAttente() === 0) return
    if (m.statut() === 'session-expiree') return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    minuterie.current = setTimeout(() => {
      minuterie.current = null
      void lancer()
    }, delaiRelance(echecs.current))
  }, [lancer])

  useEffect(() => {
    const moteur = creerMoteur({
      stockage: window.localStorage,
      appel: (...args) => window.fetch(...args),
      maintenant: () => new Date(),
      enLigne: () => navigator.onLine,
      surChangementStatut: () => {
        rafraichir()
        planifier()
      },
      surDonneesChangees: () => window.dispatchEvent(new Event(EVENEMENT_DONNEES)),
    })
    moteurRef.current = moteur
    enregistrerMoteur(moteur)
    rafraichir()

    const enLigne = () => {
      moteur.signalerReseau(true)
      echecs.current = 0
      void lancer()
    }
    const horsLigne = () => moteur.signalerReseau(false)
    const visible = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void lancer()
    }
    window.addEventListener('online', enLigne)
    window.addEventListener('offline', horsLigne)
    document.addEventListener('visibilitychange', visible)
    if (moteur.utilisateur() && navigator.onLine) void lancer()
    return () => {
      window.removeEventListener('online', enLigne)
      window.removeEventListener('offline', horsLigne)
      document.removeEventListener('visibilitychange', visible)
      enregistrerMoteur(null)
      if (minuterie.current) clearTimeout(minuterie.current)
      minuterie.current = null
    }
  }, [rafraichir, planifier, lancer])

  // Session confirmée par le serveur : le moteur s'active. Une session absente hors ligne n'éteint rien.
  useEffect(() => {
    const m = moteurRef.current
    if (!m || isPending) return
    const utilisateur = session?.user
    if (utilisateur) {
      m.activer(utilisateur.id)
      window.localStorage.setItem(CLE_EMAIL, utilisateur.email)
      if (!estMigre(window.localStorage, utilisateur.id) && aDonneesLocales(window.localStorage)) {
        if (window.sessionStorage.getItem(CLE_REPORT) !== '1') {
          setResume(resumeDonneesLocales(window.localStorage))
          setDialogue(true)
        }
      } else if (!estMigre(window.localStorage, utilisateur.id)) {
        marquerMigre(window.localStorage, utilisateur.id)
      }
      rafraichir()
      void lancer()
    } else if (!error && m.utilisateur()) {
      m.marquerSessionExpiree()
    }
  }, [session, isPending, error, rafraichir, lancer])

  const sauvegarderMaintenant = useCallback(async () => {
    const m = moteurRef.current
    const id = m?.utilisateur()
    if (!m || !id) return
    setEnvoiEnCours(true)
    m.enfilerToutesLesDonnees()
    marquerMigre(window.localStorage, id)
    await lancer()
    setEnvoiEnCours(false)
    setDialogue(false)
    rafraichir()
    if (m.enAttente() === 0) toast.success('Vos données sont sauvegardées')
    else toast.warning('Sauvegarde en attente : elle partira dès que le réseau revient.')
  }, [lancer, rafraichir])

  const activerCompte = useCallback(
    (id: string, mail: string, aDejaDesDonnees: boolean) => {
      const m = moteurRef.current
      if (!m) return
      m.activer(id)
      window.localStorage.setItem(CLE_EMAIL, mail)
      if (!aDejaDesDonnees) marquerMigre(window.localStorage, id)
      rafraichir()
    },
    [rafraichir]
  )

  const deconnecter = useCallback(async () => {
    const m = moteurRef.current
    if (!m) return false
    await lancer()
    if (m.enAttente() > 0) {
      toast.error('Impossible de se déconnecter : des données ne sont pas encore sauvegardées. Reconnectez-vous au réseau.')
      return false
    }
    try {
      await authClient.signOut()
    } catch {
      toast.error('Déconnexion impossible pour le moment. Réessayez avec du réseau.')
      return false
    }
    m.desactiver()
    viderDonneesLocales(window.localStorage)
    rafraichir()
    window.location.assign('/')
    return true
  }, [lancer, rafraichir])

  const valeur = useMemo<SyncContextValue>(
    () => ({
      statut: statutAffiche(statutBrut, migre),
      enAttente,
      rejets,
      email,
      connecte: idUtilisateur !== null,
      synchroniser: lancer,
      activerCompte,
      deconnecter,
    }),
    [statutBrut, migre, enAttente, rejets, email, idUtilisateur, lancer, activerCompte, deconnecter]
  )

  const reporter = () => {
    window.sessionStorage.setItem(CLE_REPORT, '1')
    setDialogue(false)
  }

  return (
    <SyncContext.Provider value={valeur}>
      {children}
      <Modal open={dialogue} onClose={reporter} title="Sauvegarder mes données">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: '#F2EBCF', fontSize: '1rem', lineHeight: 1.5, margin: 0 }}>
            Votre compte est prêt. Mettons vos données de ce téléphone en sécurité :
          </p>
          {resume && (
            <ul style={{ color: '#D9DEC9', fontSize: '0.95rem', lineHeight: 1.7, margin: 0, paddingLeft: '1.25rem' }}>
              <li>{resume.boutiques} boutique{resume.boutiques > 1 ? 's' : ''}</li>
              <li>{resume.produits} produit{resume.produits > 1 ? 's' : ''}</li>
              <li>{resume.clients} client{resume.clients > 1 ? 's' : ''}</li>
              <li>{resume.ventes} vente{resume.ventes > 1 ? 's' : ''}</li>
            </ul>
          )}
          <button
            onClick={() => void sauvegarderMaintenant()}
            disabled={envoiEnCours}
            style={{
              minHeight: 56,
              borderRadius: 12,
              border: 'none',
              background: '#E3A00F',
              color: '#1F3A2B',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: envoiEnCours ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <CloudUpload size={20} /> {envoiEnCours ? 'Sauvegarde en cours…' : 'Sauvegarder mes données'}
          </button>
          <button
            onClick={reporter}
            style={{ minHeight: 48, borderRadius: 12, border: '1px solid #5B755F', background: 'transparent', color: '#D9DEC9', fontWeight: 600, cursor: 'pointer' }}
          >
            Plus tard
          </button>
        </div>
      </Modal>
    </SyncContext.Provider>
  )
}

export function useSauvegarde() {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSauvegarde doit être utilisé à l’intérieur de SyncProvider')
  return ctx
}
