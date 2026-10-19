'use client'

import { Vente } from '@/lib/types'
import { useLangue } from '@/components/LangueProvider'

export default function Recu({
  vente,
  montantRecu,
  rendu,
}: {
  vente: Vente
  montantRecu?: number
  rendu?: number
}) {
  const { t } = useLangue()

  const dateHeure = new Date(vente.id).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="sugu-recu-print"
      style={{
        background: '#F8F9FA',
        color: '#0A1628',
        borderRadius: 12,
        padding: '1.5rem',
        maxWidth: 380,
        margin: '0 auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px dashed #0A1628', paddingBottom: '1rem' }}>
        <p style={{ color: '#0A1628', fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '0.05em' }}>SUGU</p>
        <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0', opacity: 0.7 }}>{t.tagline}</p>
        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0' }}>{dateHeure}</p>
        <p style={{ fontSize: '0.75rem', margin: '0.15rem 0 0', opacity: 0.6 }}>#{vente.id.toString().slice(-6)}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {vente.lignes.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', gap: '0.5rem' }}>
            <span style={{ flex: 1 }}>
              {l.nom} <span style={{ opacity: 0.6 }}>× {l.quantite}</span>
            </span>
            <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              {(l.quantite * l.prixUnit).toLocaleString('fr-FR')}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '2px dashed #0A1628', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900 }}>
          <span>{t.total}</span>
          <span>{vente.total.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ opacity: 0.7 }}>{t.modePaiementLabel}</span>
          <span style={{ fontWeight: 700 }}>{vente.modePaiement}</span>
        </div>
        {vente.statut === 'Crédit' && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>À payer plus tard</span>
            <span style={{ fontWeight: 700 }}>{vente.client}</span>
          </div>
        )}
        {typeof montantRecu === 'number' && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>{t.montantRecu}</span>
            <span>{montantRecu.toLocaleString('fr-FR')} FCFA</span>
          </div>
        )}
        {typeof rendu === 'number' && rendu > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>{t.renduMonnaie}</span>
            <span style={{ fontWeight: 700 }}>{rendu.toLocaleString('fr-FR')} FCFA</span>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, margin: 0, borderTop: '2px dashed #0A1628', paddingTop: '0.75rem' }}>
        {t.recuMerci}
      </p>
    </div>
  )
}
