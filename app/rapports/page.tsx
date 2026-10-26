'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { FileText } from 'lucide-react'
import { usePersistedBoutique } from '@/lib/storage'
import { Vente, Achat } from '@/lib/types'
import EmptyState from '@/components/EmptyState'

const MOIS_LABEL = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Rapports() {
  const [ventes, , loadedV] = usePersistedBoutique<Vente[]>('ventes', [])
  const [achats, , loadedA] = usePersistedBoutique<Achat[]>('achats', [])
  const loaded = loadedV && loadedA

  if (!loaded) return null

  const parMois = new Map<string, { ventes: number; achats: number }>()
  const cle = (date: string) => date.slice(0, 7)

  ventes.forEach((v) => {
    const k = cle(v.date)
    const e = parMois.get(k) ?? { ventes: 0, achats: 0 }
    e.ventes += v.total
    parMois.set(k, e)
  })
  achats.forEach((a) => {
    const k = cle(a.date)
    const e = parMois.get(k) ?? { ventes: 0, achats: 0 }
    e.achats += a.total
    parMois.set(k, e)
  })

  const data = Array.from(parMois.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([k, v]) => {
      const [, m] = k.split('-')
      return {
        mois: MOIS_LABEL[Number(m) - 1] ?? m,
        ventes: v.ventes,
        achats: v.achats,
        benefice: v.ventes - v.achats,
      }
    })

  const aucuneDonnee = data.length === 0

  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const croissance = last && prev && prev.ventes > 0 ? Math.round(((last.ventes - prev.ventes) / prev.ventes) * 100) : null
  const marge = last && last.ventes > 0 ? Math.round((last.benefice / last.ventes) * 100) : 0
  const meilleurMois = data.reduce((best, d) => (d.ventes > (best?.ventes ?? -1) ? d : best), data[0])

  const kpis = last
    ? [
        { label: 'Ventes (Mois en cours)', value: `${last.ventes.toLocaleString('fr-FR')} FCFA`, color: '#E3A00F' },
        { label: 'Achats (Mois en cours)', value: `${last.achats.toLocaleString('fr-FR')} FCFA`, color: '#D9DEC9' },
        { label: 'Bénéfice Net', value: `${last.benefice.toLocaleString('fr-FR')} FCFA`, color: '#91D9A3' },
        { label: 'Marge Bénéficiaire', value: `${marge}%`, color: '#E3A00F' },
        { label: 'Croissance vs Mois Précédent', value: croissance !== null ? `${croissance > 0 ? '+' : ''}${croissance}%` : '—', color: '#E3A00F' },
        { label: 'Meilleur Mois', value: meilleurMois?.mois ?? '—', color: '#E3A00F' },
      ]
    : []

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#E3A00F', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Rapports</h2>
        <p style={{ color: '#B7C5AE', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
          Performance financière basée sur vos ventes et achats enregistrés
        </p>
      </div>

      {aucuneDonnee ? (
        <EmptyState
          icon={FileText}
          title="Aucun rapport pour le moment"
          message="Enregistrez des ventes et des achats pour voir apparaître vos statistiques ici."
        />
      ) : (
        <>
          <div className="sugu-kpi-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: '#263F30', borderRadius: 12, padding: '1.1rem', border: '1px solid #496653' }}>
                <p style={{ color: '#B7C5AE', fontSize: '0.75rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {k.label}
                </p>
                <p style={{ color: k.color, fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>{k.value}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#263F30', borderRadius: 12, padding: '1.25rem', border: '1px solid #496653', marginBottom: '1rem' }}>
            <h3 style={{ color: '#F2EBCF', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem' }}>
              Ventes / Achats / Bénéfice
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#496653" />
                <XAxis dataKey="mois" stroke="#B7C5AE" fontSize={12} />
                <YAxis stroke="#B7C5AE" fontSize={12} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => `${v.toLocaleString('fr-FR')} FCFA`}
                  contentStyle={{ background: '#1F3A2B', border: '1px solid #496653', borderRadius: 8, color: '#F2EBCF' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#D9DEC9', fontSize: '0.8rem' }}>{value}</span>} />
                <Bar dataKey="ventes" name="Ventes" fill="#E3A00F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="achats" name="Achats" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benefice" name="Bénéfice" fill="#91D9A3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="sugu-table-wrap" style={{ background: '#263F30', borderRadius: 12, padding: '1.25rem', border: '1px solid #496653' }}>
            <h3 style={{ color: '#F2EBCF', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
              Détail Mensuel
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr>
                  {['Mois', 'Ventes', 'Achats', 'Bénéfice', 'Marge'].map((h) => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#B7C5AE', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #496653' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#F2EBCF', fontWeight: 600 }}>{d.mois}</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#E3A00F' }}>{d.ventes.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#D9DEC9' }}>{d.achats.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#91D9A3', fontWeight: 600 }}>{d.benefice.toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#E3A00F', fontWeight: 600 }}>
                      {d.ventes > 0 ? Math.round((d.benefice / d.ventes) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
