'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Upload, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  analyserSauvegarde,
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
      restaurerSauvegarde(window.localStorage, analyse.sauvegarde)
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

  const statut =
    jours === null
      ? 'Vous n’avez jamais sauvegardé vos données.'
      : jours === 0
        ? 'Dernière sauvegarde : aujourd’hui.'
        : `Dernière sauvegarde : il y a ${jours} jour${jours > 1 ? 's' : ''}.`

  return (
    <section
      id="sauvegarde"
      style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #f0a83266', marginBottom: '2rem' }}
    >
      <h3 style={{ color: '#f5f0e8', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={18} color="#f0a832" /> Sauvegarde de vos données
      </h3>
      <p style={{ color: '#f0a832', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.4rem' }}>
        Vos données sont enregistrées sur ce téléphone seulement.
      </p>
      <p style={{ color: '#9ba8c4', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.4rem' }}>
        Si vous changez de téléphone, effacez les données du navigateur ou désinstallez l&apos;application, tout est perdu.
        Téléchargez un fichier de sauvegarde régulièrement. Les comptes en ligne arrivent plus tard.
      </p>
      <p style={{ color: '#9ba8c4', fontSize: '0.85rem', margin: '0 0 1rem' }}>{statut}</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={exporter} style={{ ...boutonStyle, background: '#D4AF37', color: '#0A1628', border: 'none' }}>
          <Download size={20} style={{ flexShrink: 0 }} /> Exporter mes données
        </button>
        <button onClick={ouvrir} style={{ ...boutonStyle, background: '#111d34', color: '#f5f0e8', border: '1px solid #1f3054' }}>
          <Upload size={20} style={{ flexShrink: 0 }} /> Importer
        </button>
      </div>
      {input}
    </section>
  )
}
