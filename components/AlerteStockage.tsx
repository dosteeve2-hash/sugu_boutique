'use client'

import { AlertTriangle } from 'lucide-react'
import { useEchecsStockage } from '@/lib/persistance'

/**
 * Bannière affichée quand une écriture dans le stockage du navigateur a
 * échoué.
 *
 * Sans elle, l'écran continue d'afficher la vente que le commerçant vient
 * d'encaisser alors qu'elle n'a pas été enregistrée : il ferme l'onglet et
 * elle a disparu. VISION.md §4 range le stockage plein parmi les cas
 * nominaux, pas parmi les cas limites.
 */
export default function AlerteStockage() {
  const echecs = useEchecsStockage()
  if (echecs.length === 0) return null

  const quota = echecs.some((e) => e.raison === 'quota')

  return (
    <div
      role="alert"
      className="no-print"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: '#7f1d1d',
        color: '#fff5f5',
        borderBottom: '2px solid #ef4444',
        fontSize: '0.9rem',
        lineHeight: 1.45,
      }}
    >
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Enregistrement impossible — ne fermez pas cette page.</strong>
        <div style={{ marginTop: 4 }}>
          {quota
            ? "La mémoire de l'appareil est pleine. Les dernières saisies sont affichées mais ne sont pas enregistrées : notez-les, puis libérez de l'espace (historique, photos) avant de continuer."
            : "Le navigateur refuse d'enregistrer les données. Les dernières saisies sont affichées mais ne sont pas conservées : évitez la navigation privée, puis rechargez la page."}
        </div>
      </div>
    </div>
  )
}
