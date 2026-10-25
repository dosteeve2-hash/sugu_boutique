'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export type PointVentes = { jour: string; ventes: number }

export default function VentesChart({ data }: { data: PointVentes[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#496653" />
        <XAxis dataKey="jour" stroke="#B7C5AE" fontSize={12} />
        <YAxis stroke="#B7C5AE" fontSize={12} tickFormatter={(v: number) => `${v / 1000}k`} />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString('fr-FR')} FCFA`, 'Ventes']}
          contentStyle={{ background: '#1F3A2B', border: '1px solid #496653', borderRadius: 8, color: '#F2EBCF' }}
        />
        <Line type="monotone" dataKey="ventes" stroke="#E3A00F" strokeWidth={2} dot={{ fill: '#E3A00F', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
