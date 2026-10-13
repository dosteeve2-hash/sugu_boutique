'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export type PointVentes = { jour: string; ventes: number }

export default function VentesChart({ data }: { data: PointVentes[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#16233d" />
        <XAxis dataKey="jour" stroke="#7b89a8" fontSize={12} />
        <YAxis stroke="#7b89a8" fontSize={12} tickFormatter={(v: number) => `${v / 1000}k`} />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Ventes']}
          contentStyle={{ background: '#070e1f', border: '1px solid #16233d', borderRadius: 8, color: '#f5f0e8' }}
        />
        <Line type="monotone" dataKey="ventes" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
