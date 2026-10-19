'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Download, Upload, ShieldAlert, Cloud } from 'lucide-react'
import { toast } from 'sonner'
import { useSauvegarde } from '@/components/SyncProvider'
import { obtenirMoteur } from '@/lib/sync/bridge'
import {
  analyserSauvegarde,
  collecterDonnees,
  CLE_DERNIER_EXPORT,
  creerSauvegarde,
  joursDepuisExport,
  nomFichierSauvegarde,
  restaurerSauvegarde,
} from '@/lib/backup'

export function exporterDonnees(): boolean {
  try {
    const sauvegarde = creerSauvegarde(window.localStorage)
    const blob = new Blob([JSON.stringify(sauvegarde)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nomFichierSauvegarde()
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    URL.revokeObjectURL(url)
    window.localStorage.setItem(CLE_DERNIER_EXPORT, new Date().toISOString())
    window.dispatchEvent(new Event('sugu-export'))
    return true
  } catch {
    return false
  }
}

function lireJson(texte: string | undefined): unknown {
  try {
    return texte ? JSON.parse(texte) : []
  } catch {
    return []
  }
}

export function useBoutonImport() {
  const inputRef = useRef<HTMLInputElement>(null)

  const ouvrir = () => inputRef.current?.click()

  const surFichier = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    const texte = await fichier.text()
    const analyse = analyserSauvegarde(texte)
    if (!analyse.ok) {
      toast.error(analyse.erreur)
      return
    }
    const date = analyse.sauvegarde.exporteLe ? new Date(analyse.sauvegarde.exporteLe).toLocaleDateString('fr-FR') : 'date inconnue'
    const ok = window.confirm(
      `Importer la sauvegarde du ${date} ? Les données actuelles de ce téléphone seront remplacées.`
    )
    if (!ok) return
    try {
      const avant = collecterDonnees(window.localStorage)
      restaurerSauvegarde(window.localStorage, analyse.sauvegarde)
      const apres = collecterDonnees(window.localStorage)
      const moteur = obtenirMoteur()
      for (const cle of new Set([...Object.keys(avant), ...Object.keys(apres)])) {
        moteur?.noterEcriture(cle, lireJson(avant[cle]), lireJson(apres[cle]))
      }
      toast.success('Données importées')
      window.setTimeout(() => window.location.assign('/'), 600)
    } catch {
      toast.error("Import impossible : l'espace du téléphone est plein.")
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/json,.json"
      onChange={surFichier}
      aria-label="Choisir un fichier de sauvegarde SUGU"
      style={{ display: 'none' }}
    />
  )
  return { ouvrir, input }
}

const boutonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.6rem',
  minHeight: 56,
  padding: '0 1.25rem',
  borderRadius: 12,
  fontWeight: 800,
  fontSize: '1rem',
  cursor: 'pointer',
  flex: '1 1 100%',
  textAlign: 'center',
}

export default function SauvegardePanel() {
  const { ouvrir, input } = useBoutonImport()
  const { statut, email, enAttente, rejets, synchroniser, deconnecter } = useSauvegarde()
  const [jours, setJours] = useState<number | null>(null)

  useEffect(() => {
    const maj = () => setJours(joursDepuisExport(window.localStorage))
    maj()
    window.addEventListener('sugu-export', maj)
    return () => window.removeEventListener('sugu-export', maj)
  }, [])

  const exporter = () => {
    if (exporterDonnees()) toast.success('Sauvegarde téléchargée. Gardez ce fichier en lieu sûr.')
    else toast.error("Export impossible sur ce téléphone.")
  }

  const connecte = statut !== 'sans-compte'
  const statutExport =
    jours === null
      ? 'Vous n’avez jamais téléchargé de fichier de sauvegarde.'
      : jours === 0
        ? 'Dernier fichier de sauvegarde : aujourd’hui.'
        : `Dernier fichier de sauvegarde : il y a ${jours} jour${jours > 1 ? 's' : ''}.`

  return (
    <section
      id="sauvegarde"
      style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: connecte ? '1px solid #22d98a55' : '1px solid #f0a83266', marginBottom: '2rem' }}
    >
      <h3 style={{ color: '#f5f0e8', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {connecte ? <Cloud size={18} color="#22d98a" /> : <ShieldAlert size={18} color="#f0a832" />} Sauvegarde de vos données
      </h3>
      {connecte ? (
        <>
          <p style={{ color: '#22d98a', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.4rem' }}>
            Vos données sont sauvegardées en ligne{email ? ` (${email})` : ''}.
          </p>
          <p style={{ color: '#9ba8c4', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.4rem' }}>
            Sans réseau, vous continuez à vendre : tout est gardé sur le téléphone puis envoyé quand le réseau revient.
            {enAttente > 0 ? ` ${enAttente} modification${enAttente > 1 ? 's' : ''} en attente d’envoi.` : ''}
          </p>
          {rejets > 0 && (
            <p style={{ color: '#f0a832', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>
              {rejets} élément{rejets > 1 ? 's' : ''} n’{rejets > 1 ? 'ont' : 'a'} pas pu être sauvegardé{rejets > 1 ? 's' : ''} (données invalides).
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.75rem 0 1rem' }}>
            <button onClick={() => void synchroniser()} style={{ ...boutonStyle, background: '#D4AF37', color: '#0A1628', border: 'none' }}>
              Synchroniser maintenant
            </button>
            <button onClick={() => void deconnecter()} style={{ ...boutonStyle, background: '#111d34', color: '#f5f0e8', border: '1px solid #1f3054' }}>
              Me déconnecter
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: '#f0a832', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.4rem' }}>
            Vos données sont enregistrées sur ce téléphone seulement.
          </p>
          <p style={{ color: '#9ba8c4', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            Si vous changez de téléphone, effacez les données du navigateur ou désinstallez l&apos;application, tout est perdu.
            Créez un compte gratuit pour tout sauvegarder en ligne, ou téléchargez un fichier de sauvegarde.
          </p>
          <Link
            href="/compte"
            style={{ ...boutonStyle, background: '#D4AF37', color: '#0A1628', textDecoration: 'none', marginBottom: '1rem' }}
          >
            Créer mon compte gratuit
          </Link>
        </>
      )}
      <p style={{ color: '#9ba8c4', fontSize: '0.85rem', margin: '0 0 0.75rem' }}>{statutExport}</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={exporter} style={{ ...boutonStyle, background: '#111d34', color: '#f5f0e8', border: '1px solid #1f3054' }}>
          <Download size={20} style={{ flexShrink: 0 }} /> Exporter un fichier
        </button>
        <button onClick={ouvrir} style={{ ...boutonStyle, background: '#111d34', color: '#f5f0e8', border: '1px solid #1f3054' }}>
          <Upload size={20} style={{ flexShrink: 0 }} /> Importer
        </button>
      </div>
      {input}
    </section>
  )
}
