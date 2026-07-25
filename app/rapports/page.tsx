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

const data = [
  { mois: 'Avr', ventes: 1200000, achats: 750000, benefice: 450000 },
  { mois: 'Mai', ventes: 1450000, achats: 890000, benefice: 560000 },
  { mois: 'Jun', ventes: 1320000, achats: 810000, benefice: 510000 },
  { mois: 'Jul', ventes: 1750000, achats: 980000, benefice: 770000 },
]

const last = data[data.length - 1]
const prev = data[data.length - 2]
const croissance = Math.round(((last.ventes - prev.ventes) / prev.ventes) * 100)
const marge = Math.round((last.benefice / last.ventes) * 100)

const kpis = [
  { label: 'Ventes (Juillet)', value: last.ventes, color: '#D4AF37', fmt: true },
  { label: 'Achats (Juillet)', value: last.achats, color: '#9ba8c4', fmt: true },
  { label: 'Bénéfice Net', value: last.benefice, color: '#22d98a', fmt: true },
  { label: 'Marge Bénéficiaire', value: `${marge}%`, color: '#00BCD4', fmt: false },
  { label: 'Croissance vs Juin', value: `+${croissance}%`, color: '#f0a832', fmt: false },
  { label: 'Meilleur Mois', value: 'Juillet', color: '#D4AF37', fmt: false },
]

export default function Rapports() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Rapports</h2>
        <p style={{ color: '#4e5f82', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
          Performance financière — Avril à Juillet 2026
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: '#0c1528', borderRadius: 12, padding: '1.1rem', border: '1px solid #16233d' }}>
            <p style={{ color: '#4e5f82', fontSize: '0.72rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {k.label}
            </p>
            <p style={{ color: k.color, fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>
              {k.fmt ? `${(k.value as number).toLocaleString('fr-FR')} FCFA` : k.value}
            </p>
          </div>
        ))}
      </div>

      {/* BarChart */}
      <div style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d', marginBottom: '1rem' }}>
        <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 1rem' }}>
          Ventes / Achats / Bénéfice — 4 Mois
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
            <XAxis dataKey="mois" stroke="#4e5f82" fontSize={12} />
            <YAxis stroke="#4e5f82" fontSize={12} tickFormatter={(v: number) => `${v / 1000}k`} />
            <Tooltip
              formatter={(v: number) => `${v.toLocaleString('fr-FR')} FCFA`}
              contentStyle={{ background: '#070e1f', border: '1px solid #16233d', borderRadius: 8, color: '#f5f0e8' }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#9ba8c4', fontSize: '0.8rem' }}>{value}</span>
              )}
            />
            <Bar dataKey="ventes" name="Ventes" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            <Bar dataKey="achats" name="Achats" fill="#475569" radius={[4, 4, 0, 0]} />
            <Bar dataKey="benefice" name="Bénéfice" fill="#22d98a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Évolution mensuelle textuelle */}
      <div style={{ background: '#0c1528', borderRadius: 12, padding: '1.25rem', border: '1px solid #16233d' }}>
        <h3 style={{ color: '#f5f0e8', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.75rem' }}>
          Détail Mensuel
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Mois', 'Ventes', 'Achats', 'Bénéfice', 'Marge'].map((h) => (
                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: '#4e5f82', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.mois} style={{ borderTop: '1px solid #16233d' }}>
                <td style={{ padding: '0.6rem 0.75rem', color: '#f5f0e8', fontWeight: 600 }}>{d.mois}</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#D4AF37' }}>{d.ventes.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#9ba8c4' }}>{d.achats.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#22d98a', fontWeight: 600 }}>{d.benefice.toLocaleString('fr-FR')} FCFA</td>
                <td style={{ padding: '0.6rem 0.75rem', color: '#00BCD4', fontWeight: 600 }}>
                  {Math.round((d.benefice / d.ventes) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
